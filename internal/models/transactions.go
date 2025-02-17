package models

import (
	"time"

	"gorm.io/gorm"
)

type TransactionType string

const (
	Income  TransactionType = "income"
	Expense TransactionType = "expense"
)

type Transaction struct {
	gorm.Model
	UserID      uint            `gorm:"not null"`
	Amount      float64         `gorm:"not null"`
	BonusChange float64         `gorm:"default:0"`
	BonusType   TransactionType `gorm:"type:varchar(10)"`
	Currency    string          `gorm:"type:varchar(10);default:'RUB'"`
	Date        time.Time       `gorm:"not null"`
	Title       string          `gorm:"type:varchar(100);not null"`
	Description string          `gorm:"type:text"`
	Category    uint            `gorm:"not null"`
	Type        TransactionType `gorm:"type:varchar(10);not null"` // income или expense //доход или расход
}
