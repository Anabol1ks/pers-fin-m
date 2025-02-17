package transactions

import (
	"log"
	"net/http"
	"time"

	"github.com/Anabol1ks/pers-fin-m/internal/models"
	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/Anabol1ks/pers-fin-m/internal/users"
	"github.com/gin-gonic/gin"
)

type TransactionInput struct {
	Amount      float64   `json:"amount" binding:"required"`
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

	tx := storage.DB.Begin()
	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания транзакции"})
		return
	}

	// Получаем пользователя
	var user users.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Обновляем баланс
	if transaction.Type == models.Income {
		user.Balance += float64(transaction.Amount)
	} else if transaction.Type == models.Expense {
		user.Balance -= float64(transaction.Amount)
	}

	if transaction.BonusChange != 0 {
		if transaction.Type == models.Income {
			user.Bonus += transaction.BonusChange
		} else if transaction.Type == models.Expense {
			user.Bonus -= transaction.BonusChange
		}
	}

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить баланс"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, transaction)
}

// // @Security BearerAuth
// // GetAllTransactions godoc
// // @Summary Получить все транзакции пользователя
// // @Description Получить все транзакции пользователя
// // @Tags Transactions
// // @Produce json
// // @Success 200 {array} TransactionInput "Список транзакций"
// // @Failure 500 {object} response.ErrorResponse "Ошибка при получении транзакций"
// // @Router /transactions [get]
// func GetAllTransactions(c *gin.Context) {
// 	userID := c.GetUint("userID")

// 	var transactions []models.Transaction
// 	if err := storage.DB.Where("user_id = ?", userID).Find(&transactions).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении транзакций"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, transactions)
// }

// ВОЗМОЖНО ЭТО НЕ НУЖНО

type TransactionUpdate struct {
	Amount      *float64   `json:"amount"`
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

	oldAmount := transaction.Amount
	oldType := transaction.Type

	oldBonusChange := transaction.BonusChange
	oldBonusType := transaction.BonusType

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
		if input.BonusChange != nil {
			transaction.BonusChange = *input.BonusChange
		}
		if input.BonusType != nil {
			transaction.BonusType = models.TransactionType(*input.BonusType)
		}

		if *input.BonusChange == 0 {
			transaction.BonusType = ""
		}

		if transaction.BonusChange != 0 && transaction.BonusType == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "При ненулевом бонусе тип бонуса должен быть указан"})
			return
		}

		// Validate after setting both values
		if transaction.BonusChange == 0 && transaction.BonusType != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "При нулевом бонусе тип бонуса должен быть пустым"})
			return
		}

		if transaction.BonusChange != 0 && transaction.BonusType == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "При ненулевом бонусе тип бонуса должен быть указан"})
			return
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

	tx := storage.DB.Begin()

	if err := tx.Save(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления транзакции"})
		return
	}

	// Получаем пользователя
	var user users.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Рассчитываем разницу
	// Предположим, что обновление типа транзакции не меняется, или если меняется – надо логически обработать
	var delta float64
	if oldType == models.Income {
		delta = float64(transaction.Amount) - float64(oldAmount)
	} else if oldType == models.Expense {
		// Для расхода: если новая сумма больше, то баланс должен уменьшиться еще больше
		delta = float64(oldAmount) - float64(transaction.Amount)
	}

	// Обновляем баланс
	user.Balance += delta

	var bonusDelta float64
	if oldBonusType == models.Income {
		bonusDelta = float64(transaction.BonusChange) - float64(oldBonusChange)
	} else if oldBonusType == models.Expense {
		bonusDelta = float64(oldBonusChange) - float64(transaction.BonusChange)
	}
	user.Bonus += bonusDelta

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить баланс"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, transaction)
}

// @Security BearerAuth
// DeleteTransaction godoc
// @Summary Удалить транзакцию
// @Description Удаляет транзакцию пользователя по ее ID
// @Tags Transactions
// @Produce json
// @Param id path string true "ID транзакции"
// @Success 200 {object} response.SuccessResponse "Транзакция удалена"
// @Failure 404 {object} response.ErrorResponse "Транзакция не найдена"
// @Failure 500 {object} response.ErrorResponse "Ошибка при удалении транзакции"
// @Router /transactions/{id} [delete]
func DelTransactions(c *gin.Context) {
	userID := c.GetUint("userID")
	transactionID := c.Param("id")

	var transaction models.Transaction
	if err := storage.DB.Where("id = ? AND user_id = ?", transactionID, userID).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Транзакция не найдена"})
		return
	}

	tx := storage.DB.Begin()

	// Получаем пользователя
	var user users.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Обновляем баланс — отменяем влияние транзакции
	if transaction.Type == models.Income {
		// Если доход, то удаление означает уменьшение баланса
		user.Balance -= float64(transaction.Amount)
	} else if transaction.Type == models.Expense {
		// Если расход, то удаление означает увеличение баланса
		user.Balance += float64(transaction.Amount)
	}

	if transaction.BonusChange != 0 {
		if transaction.Type == models.Income {
			user.Bonus -= transaction.BonusChange
		} else if transaction.Type == models.Expense {
			user.Bonus += transaction.BonusChange
		}
	}

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить баланс"})
		return
	}

	if err := tx.Delete(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении транзакции"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Транзакция удалена"})
}

// TransactionSearchInput определяет фильтры поиска транзакций.
// Все поля опциональные.
type TransactionSearchInput struct {
	Title       *string    `form:"title"`
	Description *string    `form:"description"`
	Amount      *float64   `form:"amount"`
	BonusChange *float64   `form:"bonusChange"`
	Date        *time.Time `form:"date"`
	Category    *uint      `form:"category"`
	Type        *string    `form:"type"`
	BonusType   *string    `form:"typeBonus"`
}

// SearchTransactions godoc
// @Security BearerAuth
// @Summary Поиск транзакций
// @Description Ищет транзакции пользователя по различным опциональным параметрам
// @Tags Transactions
// @Produce json
// @Param title query string false "Название транзакции (частичное совпадение)"
// @Param amount query int false "Приблизительная сумма транзакции"
// @Param bonusChange query number false "Приблизительное количество бонусов"
// @Param date query string false "Дата транзакции (формат YYYY-MM-DD)"
// @Param category query int false "ID категории"
// @Param type query string false "Тип транзакции (income или expense)"
// @Param typeBonus query string false "Тип бонуса"
// @Success 200 {array} TransactionInput "Найденные транзакции"
// @Failure 500 {object} response.ErrorResponse "Ошибка при поиске транзакций"
// @Router /transactions/search [get]
func SearchTransactions(c *gin.Context) {
	userID := c.GetUint("userID")

	var input TransactionSearchInput
	if err := c.ShouldBindQuery(&input); err != nil {
		log.Println("Ошибка валидации параметров запроса:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Начинаем строить запрос с обязательным условием по пользователю
	query := storage.DB.Where("user_id = ?", userID)

	// Фильтрация по названию (частичное совпадение)
	if input.Title != nil && *input.Title != "" {
		// Для PostgreSQL можно использовать ILIKE для регистронезависимого поиска
		query = query.Where("title ILIKE ?", "%"+*input.Title+"%")
	}

	// Фильтрация по описанию (частичное совпадение)
	if input.Description != nil && *input.Description != "" {
		query = query.Where("description ILIKE ?", "%"+*input.Description+"%")
	}

	// Фильтрация по сумме с допуском ±10%
	if input.Amount != nil {
		tol := (float64(*input.Amount) * 0.1)
		if tol < 1 {
			tol = 1
		}
		min := *input.Amount - tol
		max := *input.Amount + tol
		query = query.Where("amount BETWEEN ? AND ?", min, max)
	}

	// Фильтрация по бонусам с допуском ±10%
	if input.BonusChange != nil {
		tol := *input.BonusChange * 0.1
		if tol < 0.1 {
			tol = 0.1
		}
		min := *input.BonusChange - tol
		max := *input.BonusChange + tol
		query = query.Where("bonus_change BETWEEN ? AND ?", min, max)
	}

	// Фильтрация по дате (ищем транзакции в пределах указанного дня)
	if input.Date != nil {
		// Определяем начало и конец дня
		year, month, day := input.Date.Date()
		loc := input.Date.Location()
		start := time.Date(year, month, day, 0, 0, 0, 0, loc)
		end := start.Add(24 * time.Hour)
		query = query.Where("date >= ? AND date < ?", start, end)
	}

	// Фильтрация по категории
	if input.Category != nil {
		query = query.Where("category = ?", *input.Category)
	}

	// Фильтрация по типу транзакции
	if input.Type != nil && *input.Type != "" {
		query = query.Where("type = ?", *input.Type)
	}

	// Фильтрация по типу бонуса
	if input.BonusType != nil && *input.BonusType != "" {
		query = query.Where("bonus_type = ?", *input.BonusType)
	}

	var transactions []models.Transaction
	if err := query.Order("date DESC").Find(&transactions).Error; err != nil {
		log.Println("Ошибка при поиске транзакций:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при поиске транзакций"})
		return
	}

	c.JSON(http.StatusOK, transactions)
}
