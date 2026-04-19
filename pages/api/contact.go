package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/salmanfaris22/nexgo/v2/pkg/api"
	"github.com/salmanfaris22/nexgo/v2/pkg/router"
)

func init() {
	router.RegisterAPI("/api/contact", ContactHandler)
}

type contactPayload struct {
	Name    string `json:"name"`
	Contact string `json:"contact"`
	Topic   string `json:"topic"`
	Message string `json:"message"`
}

func ContactHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		api.JSON(w, map[string]string{"error": "method not allowed"})
		return
	}
	var p contactPayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		api.JSON(w, map[string]string{"error": "invalid payload"})
		return
	}
	if p.Name == "" || p.Contact == "" || p.Message == "" {
		api.JSON(w, map[string]string{"error": "missing fields"})
		return
	}
	log.Printf("[contact] new lead: %s (%s) topic=%s msg=%q", p.Name, p.Contact, p.Topic, p.Message)
	api.JSON(w, map[string]string{"status": "ok"})
}
