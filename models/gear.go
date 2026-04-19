package models

func FeaturedGear() []Gear { g := AllGear(); return g[:4] }

func AllGear() []Gear {
	return []Gear{
		{"g1", "Sleeping Bag", "സ്ലീപ്പിംഗ് ബാഗ്", "₹150/day", "🛌",
			"All-weather mummy bag, washed before every trip.",
			"എല്ലാ കാലാവസ്ഥയ്ക്കും അനുയോജ്യമായ സ്ലീപ്പിംഗ് ബാഗ്."},
		{"g2", "Trekking Backpack", "ട്രെക്കിംഗ് ബാഗ്", "₹200/day", "🎒",
			"60L pack with rain cover and ergonomic frame.",
			"60L മഴ കവർ സഹിതമുള്ള ട്രെക്കിംഗ് ബാഗ്."},
		{"g3", "Camping Stove", "ക്യാമ്പിംഗ് സ്റ്റവ്", "₹100/day", "🔥",
			"Portable gas stove with windscreen.",
			"കാറ്റ് തടയുന്ന പോർട്ടബിൾ ഗ്യാസ് സ്റ്റവ്."},
		{"g4", "LED Lantern", "എൽഇഡി വിളക്ക്", "₹80/day", "💡",
			"Rechargeable lantern, 12 hour runtime.",
			"12 മണിക്കൂർ ബാറ്ററി റീചാർജബിൾ വിളക്ക്."},
		{"g5", "Trekking Pole", "ട്രെക്കിംഗ് വടി", "₹70/day", "🥢",
			"Adjustable carbon pole, pair.",
			"അഡ്ജസ്റ്റബിൾ കാർബൺ ട്രെക്കിംഗ് വടി, ജോഡി."},
		{"g6", "Cooler Box", "കൂളർ ബോക്സ്", "₹120/day", "🧊",
			"25L insulated cooler, 24hr ice retention.",
			"24 മണിക്കൂർ ഐസ് നിലനിർത്തുന്ന 25L കൂളർ ബോക്സ്."},
	}
}
