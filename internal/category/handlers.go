package сategory

import (
	"log"
	"net/http"

	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/gin-gonic/gin"
)

// @Security BearerAuth
// GetAllCategories godoc
// @Summary Получить категории
// @Description Получить все категории пользователя или категории по умолчанию
// @Tags Categories
// @Produce json
// @Success 200 {array} Category
// @Failure 500 {object} response.ErrorResponse "Ошибка при получении категорий"
// @Router /categories [get]
func GetAllCategories(c *gin.Context) {
	userID := c.GetUint("userID")

	var categories []Category
	if err := storage.DB.Where("user_id IS NULL OR user_id = ?", userID).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
		return
	}

	c.JSON(http.StatusOK, categories)
}

type CreateCategoryInput struct {
	Name string `json:"name" binding:"required"`
}

// @Security BearerAuth
// CreateCategory godoc
// @Summary Создать категорию
// @Description Создать новую категорию для пользователя
// @Tags Categories
// @Accept json
// @Produce json
// @Param input body CreateCategoryInput true "Категория для создания"
// @Success 201 {object} Category
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

	if err := storage.DB.Where("name = ? AND user_id = ?", input.Name, userID).First(&Category{}).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Категория с таким названием уже существует"})
		return
	}

	category := Category{
		Name:   input.Name,
		UserID: &userID,
	}

	if err := storage.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании категории"})
		return
	}

	c.JSON(http.StatusCreated, category)
}
