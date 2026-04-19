package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/salmanfaris22/nexgo/v2/pkg/api"
	"github.com/salmanfaris22/nexgo/v2/pkg/router"
)

func init() {
	router.RegisterAPI("/api/vitals", VitalsHandler)
}

// vitalsReport is what the CoreWebVitalsScript POSTs from the browser.
type vitalsReport struct {
	Name  string  `json:"name"`  // CLS, LCP, FID, INP, FCP, TTFB
	Value float64 `json:"value"`
	ID    string  `json:"id"`
	Rating string `json:"rating"` // good / needs-improvement / poor
	Page  string  `json:"page"`
}

// VitalsHandler receives Core Web Vitals reports from the browser.
// Logs them for now; wire to a metrics backend later if you want dashboards.
func VitalsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		api.JSON(w, map[string]string{"status": "ok"})
		return
	}
	var v vitalsReport
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		api.JSON(w, map[string]string{"status": "bad-payload"})
		return
	}
	log.Printf("[vitals] %s=%.2f rating=%s page=%s", v.Name, v.Value, v.Rating, v.Page)
	api.JSON(w, map[string]string{"status": "ok"})
}
