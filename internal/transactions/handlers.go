package transactions

import (
	"log"
	"net/http"
	"time"

	"github.com/Anabol1ks/pers-fin-m/internal/models"
	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/gin-gonic/gin"
)

type TransactionInput struct {
	Amount      int       `json:"amount" binding:"required"`
	BonusChange float64   `json:"bonusChange"`
	Currency    string    `json:"currency"`
	Date        time.Time `json:"date"`
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Category    uint      `json:"category"`
	Type        string    `json:"type" binding:"required,oneof=income expense"`
	BonusType   string    `json:"typeBonus"`
}

// @Security BearerAuth
// CreateTransaction godoc
// @Summary Создать транзакцию
// @Description Создает новую транзакцию для пользователя
// @Tags Transactions
// @Accept json
// @Produce json
// @Param input body TransactionInput true "Транзакция для создания"
// @Success 201 {object} TransactionInput
// @Failure 400 {object} response.ErrorResponse "Ошибка валидации"
// @Failure 500 {object} response.ErrorResponse "Ошибка создания транзакции"
// @Router /transactions [post]
func CreateTransaction(c *gin.Context) {
	userID := c.GetUint("userID")

	var input TransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Println("Ошибка валидации:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Amount <= 0 {
		log.Println("Сумма должна быть больше 0")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Сумма должна быть больше 0"})
		return
	}

	if input.BonusChange == 0 && input.BonusType != "" {
		log.Println("При нулевом бонусе тип бонуса должен быть пустым")
		c.JSON(http.StatusBadRequest, gin.H{"error": "При нулевом бонусе тип бонуса должен быть пустым"})
		return
	}

	if input.BonusChange != 0 && input.BonusType == "" {
		log.Println("При ненулевом бонусе тип бонуса должен быть указан")
		c.JSON(http.StatusBadRequest, gin.H{"error": "При ненулевом бонусе тип бонуса должен быть указан"})
		return
	}

	var category models.Category
	if err := storage.DB.
		Where("id = ? AND (user_id IS NULL OR user_id = ?)", input.Category, userID).
		First(&category).Error; err != nil {
		log.Println("Указана неверная категория")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Указана неверная категория"})
		return
	}

	if input.Date.IsZero() {
		input.Date = time.Now()
	}

	if input.Currency == "" {
		input.Currency = "RUB"
	}

	// Создание транзакции в базе данных
	transaction := models.Transaction{
		UserID:      userID,
		Amount:      input.Amount,
		BonusChange: input.BonusChange,
		BonusType:   models.TransactionType(input.BonusType),
		Currency:    input.Currency,
		Date:        input.Date,
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
		Type:        models.TransactionType(input.Type),
	}

	if err := storage.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания транзакции"})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

// @Security BearerAuth
// GetAllTransactions godoc
// @Summary Получить все транзакции пользователя
// @Description Получить все транзакции пользователя
// @Tags Transactions
// @Produce json
// @Success 200 {array} models.Transaction "Список транзакций"
// @Failure 500 {object} response.ErrorResponse "Ошибка при получении транзакций"
// @Router /transactions [get]
func GetAllTransactions(c *gin.Context) {
	userID := c.GetUint("userID")

	var transactions []models.Transaction
	if err := storage.DB.Where("user_id = ?", userID).Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении транзакций"})
		return
	}

	c.JSON(http.StatusOK, transactions)
}
