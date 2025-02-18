package main

import (
	"fmt"
	"log"
	"os"

	_ "github.com/Anabol1ks/pers-fin-m/docs"
	"github.com/Anabol1ks/pers-fin-m/internal/auth"
	сategory "github.com/Anabol1ks/pers-fin-m/internal/category"
	"github.com/Anabol1ks/pers-fin-m/internal/models"
	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/Anabol1ks/pers-fin-m/internal/transactions"
	"github.com/Anabol1ks/pers-fin-m/internal/users"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @Title Персональный финансовый менеджер
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	key := os.Getenv("ENV_CHEK")
	if key == "" {
		fmt.Println("Подключение к .env")
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Ошибка получения .env")
		}
	}
	storage.ConnectDatabase()

	if err := storage.DB.AutoMigrate(&users.User{}, &models.Transaction{}, &models.Category{}); err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3001"}, // Укажи адрес фронтенда React
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.POST("/auth/register", auth.RegisterHandler)
	r.POST("/auth/login", auth.LoginHandler)

	authorized := r.Group("/")
	{
		authorized.Use(auth.AuthMiddleware())
		authorized.POST("/transactions", transactions.CreateTransaction)
		// authorized.GET("/transactions", transactions.GetAllTransactions)
		authorized.GET("/transactions/search", transactions.SearchTransactions)
		authorized.PUT("/transactions/:id", transactions.UpdateTransaction)
		authorized.DELETE("/transactions/:id", transactions.DelTransactions)

		authorized.GET("/categories", сategory.GetAllCategories)
		authorized.POST("/categories", сategory.CreateCategory)
		authorized.DELETE("/categories/:id", сategory.DelCategory)
		authorized.PUT("/categories/:id", сategory.UpdateCategory)

		authorized.GET("/users/balance", users.GetBalanceHandler)
		authorized.PUT("/users/balance", users.UpdateBalanceHandler)
		authorized.GET("/users/bonus", users.GetBonusHandler)
		authorized.PUT("/users/bonus", users.UpdateBonusHandler)

		authorized.POST("/auth/verify", auth.VerifyEmailHandler)
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}
