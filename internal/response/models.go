package response

// ErrorResponse представляет стандартный формат ответа при ошибке
// @Description Стандартный ответ при ошибке
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse представляет стандартный формат успешного ответа
// @Description Стандартный ответ при успешном выполнении
type SuccessResponse struct {
	Message string `json:"message"`
}

type TokenResponse struct {
	Token string `json:"token" example:"Ваш токен"`
}

type MessageResponse struct {
	Message string `json:"message"`
}
