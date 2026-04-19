package models

import "testing"

func TestAllTents_HasSixEntries(t *testing.T) {
	if got := len(AllTents()); got != 6 {
		t.Errorf("AllTents len = %d, want 6", got)
	}
}

func TestFeaturedTents_AreFirstThree(t *testing.T) {
	feat := FeaturedTents()
	if len(feat) != 3 {
		t.Fatalf("FeaturedTents len = %d, want 3", len(feat))
	}
	for _, tt := range feat {
		if !tt.Featured {
			t.Errorf("tent %s not marked featured", tt.Name)
		}
	}
}

func TestAllGear_HasSixEntries(t *testing.T) {
	if got := len(AllGear()); got != 6 {
		t.Errorf("AllGear len = %d, want 6", got)
	}
}

func TestUpcomingEvents_NotEmpty(t *testing.T) {
	if len(UpcomingEvents()) == 0 {
		t.Error("UpcomingEvents returned empty")
	}
}

func TestDefaultStats_Sane(t *testing.T) {
	s := DefaultStats()
	if s.Posts <= 0 || s.Followers <= 0 {
		t.Errorf("DefaultStats has non-positive values: %+v", s)
	}
}
