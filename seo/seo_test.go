package seo

import "testing"

func TestWrap_NilProps(t *testing.T) {
	got := Wrap("Home", "Welcome", nil)
	if got["title"] != "Home" {
		t.Errorf("title = %v, want Home", got["title"])
	}
	if got["description"] != "Welcome" {
		t.Errorf("description = %v, want Welcome", got["description"])
	}
}

func TestWrap_PreservesExisting(t *testing.T) {
	got := Wrap("Tents", "Rent gear", map[string]interface{}{
		"count": 6,
	})
	if got["count"] != 6 {
		t.Errorf("count = %v, want 6", got["count"])
	}
	if got["title"] != "Tents" {
		t.Errorf("title not set")
	}
}

func TestKeywords_HasMalayalam(t *testing.T) {
	kws := Keywords()
	if len(kws) == 0 {
		t.Fatal("Keywords() returned empty slice")
	}
	hasMl := false
	for _, k := range kws {
		if k == "യാത്ര" {
			hasMl = true
			break
		}
	}
	if !hasMl {
		t.Error("expected at least one Malayalam keyword")
	}
}
