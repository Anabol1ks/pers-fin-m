package сategory

import (
	"log"
	"net/http"

	"github.com/Anabol1ks/pers-fin-m/internal/models"
	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/gin-gonic/gin"
)

// @Security BearerAuth
// GetAllCategories godoc
// @Summary Получить категории
// @Description Получить все категории пользователя или категории по умолчанию
// @Tags Categories
// @Produce json
// @Success 200 {array} models.Category
// @Failure 500 {object} response.ErrorResponse "Ошибка при получении категорий"
// @Router /categories [get]
func GetAllCategories(c *gin.Context) {
	userID := c.GetUint("userID")

	var categories []models.Category
	if err := storage.DB.Where("user_id IS NULL OR user_id = ?", userID).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
		return
	}

	c.JSON(http.StatusOK, categories)
}

type CreateCategoryInput struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color"`
}

// @Security BearerAuth
// CreateCategory godoc
// @Summary Создать категорию
// @Description Создать новую категорию для пользователя
// @Tags Categories
// @Accept json
// @Produce json
// @Param input body CreateCategoryInput true "Категория для создания"
// @Success 201 {object} models.Category
// @Failure 400 {object} response.ErrorResponse "Ошибка валидации"
// @Failure 500 {object} response.ErrorResponse "Ошибка создания категории"
// @Router /categories [post]
func CreateCategory(c *gin.Context) {
	userID := c.GetUint("userID")
	log.Println(userID)

	var input CreateCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := storage.DB.Where("name = ? AND user_id = ?", input.Name, userID).First(&models.Category{}).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Категория с таким названием уже существует"})
		return
	}

	category := models.Category{
		Name:   input.Name,
		UserID: &userID,
		Color:  input.Color,
	}

	if err := storage.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании категории"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// @Security BearerAuth
// DelCategory godoc
// @Summary Удалить категорию
// @Description Удалить категорию пользователя
// @Tags Categories
// @Produce json
// @Param id path string true "ID категории"
// @Success 200 {object} response.SuccessResponse "Категория успешно удалена"
// @Failure 404 {object} response.ErrorResponse "Категория не найдена или не принадлежит пользователю"
// @Failure 500 {object} response.ErrorResponse "Ошибка удаления категории"
// @Router /categories/{id} [delete]
func DelCategory(c *gin.Context) {
	userID := c.GetUint("userID")
	categoryID := c.Param("id")

	var uncategorized models.Category
	if err := storage.DB.Where("name = ? AND user_id IS NULL", "Без категории").First(&uncategorized).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категории 'Без категории'"})
		return
	}

	var category models.Category
	if err := storage.DB.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Категория не найдена или не принадлежит пользователю"})
		return
	}

	if err := storage.DB.Model(&models.Transaction{}).Where("category = ? AND user_id = ?", categoryID, userID).Update("category", uncategorized.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении транзакций"})
		return
	}

	if err := storage.DB.Delete(category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении категории"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Категория успешно удалена"})
}

type UpdateCategoryInput struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

// @Security BearerAuth
// UpdateCategory godoc
// @Summary Обновить категорию
// @Description Обновить информацию о категории пользователя
// @Tags Categories
// @Accept json
// @Produce json
// @Param id path string true "ID категории"
// @Param input body UpdateCategoryInput true "Категория для обновления"
// @Success 200 {object} models.Category "Категория успешно обновлена"
// @Failure 400 {object} response.ErrorResponse "Ошибка валидации"
// @Failure 404 {object} response.ErrorResponse "Категория не найдена"
// @Failure 500 {object} response.ErrorResponse "Ошибка обновления категории"
// @Router /categories/{id} [put]
func UpdateCategory(c *gin.Context) {
	userID := c.GetUint("userID")
	categoryID := c.Param("id")

	var input UpdateCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var category models.Category
	if err := storage.DB.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Категория не найдена"})
		return
	}
	if input.Name != "" {
		category.Name = input.Name
	}
	if input.Color != "" {
		category.Color = input.Color
	}
	if err := storage.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении категории"})
		return
	}
	c.JSON(http.StatusOK, category)
}
