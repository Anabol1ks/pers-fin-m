package main

import (
	"log"

	email "github.com/Anabol1ks/pers-fin-m/internal/emails"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Ошибка получения .env")
	}
	// max := big.NewInt(1000000) // Диапазон [0, 1000000)
	// n, err := rand.Int(rand.Reader, max)
	// if err != nil {
	// 	panic(err)
	// }
	// code := fmt.Sprintf("%06d", n.Int64())
	// fmt.Println("Код подтверждения:", code)

	email.SendVerifyCode("Anabol1ks", "grigorogannisyan.12@gmail.com", "228322")
}
