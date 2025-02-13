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
// @Success 200 {array} TransactionInput "Список транзакций"
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

type TransactionUpdate struct {
	Amount      *int       `json:"amount"`
	BonusChange *float64   `json:"bonusChange"`
	Currency    *string    `json:"currency"`
	Date        *time.Time `json:"date"`
	Title       *string    `json:"title"`
	Description *string    `json:"description"`
	Category    *uint      `json:"category"`
	Type        *string    `json:"type" binding:"omitempty,oneof=income expense"`
	BonusType   *string    `json:"typeBonus"`
}

// @Security BearerAuth
// UpdateTransaction godoc
// @Summary Обновить транзакцию
// @Description Обновляет существующую транзакцию пользователя
// @Tags Transactions
// @Accept json
// @Produce json
// @Param id path string true "ID транзакции"
// @Param input body TransactionUpdate true "Данные для обновления транзакции"
// @Success 200 {object} TransactionInput "Обновленная транзакция"
// @Failure 400 {object} response.ErrorResponse "Ошибка валидации или неверные данные"
// @Failure 404 {object} response.ErrorResponse "Транзакция не найдена"
// @Failure 500 {object} response.ErrorResponse "Ошибка обновления транзакции"
// @Router /transactions/{id} [put]
func UpdateTransaction(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID := c.Param("id")

	var input TransactionUpdate
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Println("Ошибка валидации:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var transaction models.Transaction
	if err := storage.DB.Where("id = ? AND user_id = ?", transactionID, userID).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Транзакция не найдена"})
		return
	}

	// Обновление суммы
	if input.Amount != nil {
		if *input.Amount <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Сумма должна быть больше 0"})
			return
		}
		transaction.Amount = *input.Amount
	}

	// Обновление бонусов
	if input.BonusChange != nil || input.BonusType != nil {
		newBonusChange := transaction.BonusChange
		if input.BonusChange != nil {
			newBonusChange = *input.BonusChange
		}

		newBonusType := transaction.BonusType
		if input.BonusType != nil {
			newBonusType = models.TransactionType(*input.BonusType)
		}

		if newBonusChange == 0 && newBonusType != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "При нулевом бонусе тип бонуса должен быть пустым"})
			return
		}

		if newBonusChange != 0 && newBonusType == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "При ненулевом бонусе тип бонуса должен быть указан"})
			return
		}

		if input.BonusChange != nil {
			transaction.BonusChange = newBonusChange
		}
		if input.BonusType != nil {
			transaction.BonusType = newBonusType
		}
	}

	// Обновление валюты
	if input.Currency != nil {
		transaction.Currency = *input.Currency
	}

	// Обновление даты
	if input.Date != nil {
		transaction.Date = *input.Date
	}

	// Обновление названия
	if input.Title != nil {
		transaction.Title = *input.Title
	}

	// Обновление описания
	if input.Description != nil {
		transaction.Description = *input.Description
	}

	// Обновление категории
	if input.Category != nil {
		var category models.Category
		if err := storage.DB.
			Where("id = ? AND (user_id IS NULL OR user_id = ?)", *input.Category, userID).
			First(&category).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Указана неверная категория"})
			return
		}
		transaction.Category = *input.Category
	}

	// Обновление типа транзакции
	if input.Type != nil {
		transaction.Type = models.TransactionType(*input.Type)
	}

	// Сохранение изменений
	if err := storage.DB.Save(&transaction).Error; err != nil {
		log.Println("Ошибка обновления транзакции:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления транзакции"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}
