package main

import (
	"fmt"
	"log"
	"os"

	_ "github.com/Anabol1ks/pers-fin-m/docs"
	"github.com/Anabol1ks/pers-fin-m/internal/auth"
	"github.com/Anabol1ks/pers-fin-m/internal/storage"
	"github.com/Anabol1ks/pers-fin-m/users"
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

	storage.DB.AutoMigrate(&users.User{})

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

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}
