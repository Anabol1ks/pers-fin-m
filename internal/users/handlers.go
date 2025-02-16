package users

import (
	"net/http"

	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/gin-gonic/gin"
)

// @Security BearerAuth
// GetBalanceHandler godoc
// @Summary Получить текущий баланс пользователя
// @Description Получает текущий баланс пользователя
// @Tags Users
// @Produce json
// @Success 200 {object} response.BalanceResponse "Баланс пользователя"
// @Failure 500 {object} response.ErrorResponse "Ошибка при получении баланса"
// @Router /users/balance [get]
func GetBalanceHandler(c *gin.Context) {
	userID := c.GetUint("userID")

	var user User
	if err := storage.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"balance": user.Balance})
}

type UpdateBalanceInput struct {
	Balance float64 `json:"balance" binding:"required"`
}

// @Security BearerAuth
// UpdateBalanceHandler godoc
// @Summary Обновить баланс пользователя
// @Description Обновляет баланс пользователя
// @Tags Users
// @Accept json
// @Produce json
// @Param input body UpdateBalanceInput true "Новый баланс"
// @Success 200 {object} response.BalanceResponse "Обновленный баланс"
// @Failure 400 {object} response.ErrorResponse "Ошибка валидации"
// @Failure 500 {object} response.ErrorResponse "Ошибка при обновлении баланса"
// @Router /users/balance [put]
func UpdateBalanceHandler(c *gin.Context) {
	userID := c.GetUint("userID")

	var input UpdateBalanceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Balance <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Баланс должен быть положительным числом"})
		return
	}

	var user User
	if err := storage.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Обновляем баланс
	user.Balance = input.Balance
	if err := storage.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить баланс"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"balance": user.Balance})
}

// @Security BearerAuth
// GetBalanceHandler godoc
// @Summary Получить текущий баланс бонусов пользователя
// @Description Получает текущий баланс бонусов пользователя
// @Tags Users
// @Produce json
// @Success 200 {object} response.BonusResponse "Бонусы пользователя"
// @Failure 500 {object} response.ErrorResponse "Ошибка при получении бонусов"
// @Router /users/bonus [get]
func GetBonusHandler(c *gin.Context) {
	userID := c.GetUint("userID")

	var user User
	if err := storage.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bonus": user.Bonus})
}

type UpdateBonusInput struct {
	Bonus float64 `json:"bonus" binding:"required"`
}

// @Security BearerAuth
// UpdateBalanceHandler godoc
// @Summary Обновить бонусов пользователя
// @Description Обновляет бонусы пользователя
// @Tags Users
// @Accept json
// @Produce json
// @Param input body UpdateBonusInput true "Новый баланс бонусов"
// @Success 200 {object} response.BonusResponse "Обновленный баланс бонусов"
// @Failure 400 {object} response.ErrorResponse "Ошибка валидации"
// @Failure 500 {object} response.ErrorResponse "Ошибка при обновлении баланса бонусов"
// @Router /users/bonus [put]
func UpdateBonusHandler(c *gin.Context) {
	userID := c.GetUint("userID")

	var input UpdateBonusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Bonus <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Баланс бонусов должен быть положительным числом"})
		return
	}

	var user User
	if err := storage.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Обновляем баланс
	user.Bonus = input.Bonus
	if err := storage.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить баланс бонусов"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"balance": user.Bonus})
}
