package auth

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/Anabol1ks/pers-fin-m/internal/users"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Registerhandler godoc
// @Summary Регистрация пользователя
// @Description Регистрация пользователя с указанием никнейма, почты, пароля
// @Tags auth
// @Accept json
// @Produce json
// @Param input body RegisterInput true "Данные пользователя"
// @Success 201 {object} response.SuccessResponse "Успешная регистрация"
// @Failure 400 {object} response.ErrorResponse "Описание ошибки валидации"
// @Failure 409 {object} response.ErrorResponse "Почта уже зарегистрированы"
// @Failure 500 {object} response.ErrorResponse "Не удалось хешировать пароль или создать пользователя"
// @Router /auth/register [post]
func RegisterHandler(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ValidatePassword(input.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Email = strings.ToLower(input.Email)

	var existingUser users.User
	if err := storage.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Почта уже зарегистрированны"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось хешировать пароль"})
		return
	}

	verifCode, err := GenerateVerificationCode()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации кода подтверждения"})
		return
	}

	user := users.User{
		Username:         input.Username,
		Email:            input.Email,
		Password:         string(hashedPassword),
		VerificationCode: verifCode,
	}

	if err := storage.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInsufficientStorage, gin.H{"error": "Не удалось создать пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Регистрация успешна"})
}

func ValidatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("пароль должен содержать минимум 8 символов")
	}

	lowercaseRegex := regexp.MustCompile(`[a-z]`)
	uppercaseRegex := regexp.MustCompile(`[A-Z]`)
	digitRegex := regexp.MustCompile(`\d`)

	if !lowercaseRegex.MatchString(password) {
		return errors.New("пароль должен содержать хотя бы одну строчную букву")
	}
	if !uppercaseRegex.MatchString(password) {
		return errors.New("пароль должен содержать хотя бы одну заглавную букву")
	}
	if !digitRegex.MatchString(password) {
		return errors.New("пароль должен содержать хотя бы одну цифру")
	}

	return nil
}

var jwtSecret = []byte(os.Getenv("JWT_KEY"))

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginHandler godoc
// @Summary Авторизация
// @Description Авторизация пользователя с указанием почты и пароля
// @Tags auth
// @Accept json
// @Produce json
// @Param input body LoginInput true "Данные пользователя"
// @Success 200 {object} response.TokenResponse "Успешная авторизация"
// @Failure 400 {object} response.ErrorResponse "Описание ошибки валидации"
// @Failure 401 {object} response.ErrorResponse "Неверный пароль"
// @Failure 404 {object} response.ErrorResponse "Пользователя с такой почтой не существует"
// @Router /auth/login [post]
func LoginHandler(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Email = strings.ToLower(input.Email)

	var user users.User
	if err := storage.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователя с такой почтой не существует"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный пароль"})
		return
	}

	token := GenerateJWT(user.ID)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func GenerateJWT(userID uint) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 300).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)
	return tokenString
}

func GenerateVerificationCode() (string, error) {
	max := big.NewInt(1000000) // Диапазон [0, 1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}
	code := fmt.Sprintf("%06d", n.Int64())
	return code, nil
}

type VerificationCodeInput struct {
	Code string `json:"code" binding:"required,len=6"`
}

// @Security BearerAuth
// VerifyEmailHandler godoc
// @Summary Подтверждение аккаунта
// @Description Подтверждение аккаунта пользователя с указанием почты и кода подтверждения
// @Tags auth
// @Accept json
// @Produce json
// @Param input body VerificationCodeInput true "Данные пользователя"
// @Success 200 {object} response.SuccessResponse "Аккаунт успешно подтверждён"
// @Failure 400 {object} response.ErrorResponse "Неверный код подтверждения"
// @Failure 404 {object} response.ErrorResponse "Пользователь не существует"
// @Failure 409 {object} response.ErrorResponse "Аккаунт уже подтверждён"
// @Router /auth/verify [post]
func VerifyEmailHandler(c *gin.Context) {
	userID := c.GetUint("userID")

	var input VerificationCodeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user users.User
	if err := storage.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	if user.Verified {
		c.JSON(http.StatusConflict, gin.H{"error": "Аккаунт уже подтверждён"})
		return
	}

	if user.VerificationCode != input.Code {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный код подтверждения"})
		return
	}

	user.Verified = true
	user.VerificationCode = ""
	if err := storage.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить пользователя"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Аккаунт успешно подтверждён"})
}
