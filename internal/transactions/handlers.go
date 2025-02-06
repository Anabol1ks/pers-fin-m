package transactions

import (
	"net/http"
	"time"

	сategory "github.com/Anabol1ks/pers-fin-m/internal/category"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var category сategory.Category
	if err := storage.DB.
		Where("id = ? AND (user_id IS NULL OR user_id = ?)", input.Category, userID).
		First(&category).Error; err != nil {
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
	transaction := Transaction{
		UserID:      userID,
		Amount:      input.Amount,
		BonusChange: input.BonusChange,
		Currency:    input.Currency,
		Date:        input.Date,
		Title:       input.Title,
		Description: input.Description,
		Category:    input.Category,
	}

	if err := storage.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания транзакции"})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}
