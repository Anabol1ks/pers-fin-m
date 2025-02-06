package auth

import (
	"net/http"
	"os"
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

	user := users.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := storage.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInsufficientStorage, gin.H{"error": "Не удалось создать пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Регистрация успешна"})
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
