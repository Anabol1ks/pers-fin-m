package email

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
)

func SendEmail(to, subject, body string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	fromEmail := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")

	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		fromEmail, to, subject, body,
	)

	auth := smtp.PlainAuth("", fromEmail, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{to}, []byte(message))
	if err != nil {
		return err
	}

	return nil
}

// Структура для передачи данных в шаблон
type VerifyData struct {
	Username string
	Code     string
}

// HTML-шаблон для письма.
// Обратите внимание, что вместо %s теперь используются плейсхолдеры {{.Username}} и {{.Code}}
var emailTemplate = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>Подтверждение аккаунта</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* Увеличиваем базовый размер шрифта */
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      font-size: 18px; /* базовый размер шрифта */
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0a0a0a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff; /* текст всегда белый */
      line-height: 1.5;
    }

    /* Принудительно задаем белый цвет для всех ссылок */
    a, a:link, a:visited, a:hover, a:active {
      color: #ffffff !important;
      text-decoration: none;
    }

    .container {
      width: 100%;
      max-width: 600px;
      padding: 32px;
      background-color: hsl(240, 10%, 4%);
      border: 1px solid hsl(240, 5%, 26%);
      border-radius: 12px;
      box-sizing: border-box;
    }

    .header {
      text-align: center;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid hsl(240, 5%, 26%);
    }

    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .content {
      font-size: 18px; /* увеличенный размер шрифта для основного контента */
      color: #ffffff;
      margin-bottom: 32px;
    }

    .content p {
      margin: 16px 0;
    }

    .code {
      display: inline-block;
      padding: 16px 32px;
      font-size: 24px;
      font-weight: 700;
      background-color: hsl(240, 5%, 12%);
      border: 1px solid hsl(240, 5%, 26%);
      border-radius: 8px;
      margin: 24px 0;
      color: #ffffff;
      letter-spacing: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      background-color: hsl(240, 5%, 96%);
      color: #ffffff !important;
      border-radius: 6px;
      font-weight: 600;
      border: 1px solid hsl(240, 5%, 84%);
      transition: all 0.2s ease;
      margin-top: 16px;
    }

    .button:hover {
      background-color: hsl(240, 5%, 90%);
      transform: translateY(-1px);
    }

    .footer {
      font-size: 14px;
      color: #ffffff;
      text-align: center;
      padding-top: 24px;
      margin-top: 32px;
      border-top: 1px solid hsl(240, 5%, 26%);
    }

    @media (prefers-color-scheme: light) {
      body {
        background-color: #ffffff;
        /* Если нужно оставить текст белым в светлой теме, оставляем #ffffff,
           но обычно в светлой теме лучше использовать темный текст для контраста */
        color: #ffffff; 
      }

      .container {
        background-color: #ffffff;
        border-color: hsl(240, 5%, 90%);
      }

      .header h1,
      .content,
      .code,
      .footer {
        color: #ffffff;
      }

      .code {
        background-color: hsl(0, 0%, 98%);
        border-color: hsl(240, 5%, 90%);
      }
				
      .button:hover {
        background-color: hsl(240, 10%, 10%);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Подтверждение аккаунта</h1>
    </div>

    <div class="content">
      <p>Здравствуйте, {{.Username}}</p>
      <p>Для завершения регистрации используйте код подтверждения ниже:</p>

      <div class="code">{{.Code}}</div>

      <p>Если вы не запрашивали регистрацию, проигнорируйте это письмо.</p>
    </div>

    <div class="footer">
      <p>С уважением,<br>Команда PFM</p>
      <p style="margin-top: 8px;">© 2025 PFM. Все права защищены</p>
    </div>
  </div>
</body>
</html>`

func SendVerifyCode(username, email, code string) error {
	// Подготовка данных для шаблона
	data := VerifyData{
		Username: username,
		Code:     code,
	}

	// Создаём новый шаблон и парсим его
	tmpl, err := template.New("verifyEmail").Parse(emailTemplate)
	if err != nil {
		log.Println("Ошибка парсинга шаблона:", err)
		return err
	}

	// Выполняем шаблон с данными и записываем результат в буфер
	var buf bytes.Buffer
	if err = tmpl.Execute(&buf, data); err != nil {
		log.Println("Ошибка выполнения шаблона:", err)
		return err
	}

	// Получаем итоговый HTML-код письма
	body := buf.String()
	subject := "Подтверждение аккаунта"
	if err := SendEmail(email, subject, body); err != nil {
		log.Println("Ошибка отправки письма:", err)
		return err
	}

	log.Println("Письмо отправлено")
	return nil
}
