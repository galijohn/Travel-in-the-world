// =====================================================================
//  נתוני המפה. אפשר לערוך דרך edit.html, או ידנית כאן.
//
//  who: "together" (יחד) | "me" (אני) | "partner" (בת הזוג)
//       או רשימה, למשל ["me", "partner"] = כל אחד היה שם בנפרד
//  code: קוד מדינה בן 3 אותיות (ISR, ITA, FRA ...)
// =====================================================================

window.TRAVEL = {
  "googleApiKey": "AIzaSyDT4_Elqc3oi3qNchpMuRNf01IScK9LZYs",
  "people": {
    "me": {
      "name": "גלי",
      "color": "#4cc9f0"
    },
    "partner": {
      "name": "רוזית",
      "color": "#f72585"
    },
    "together": {
      "name": "יחד",
      "color": "#ffd166"
    }
  },
  "countries": [
    {
      "code": "CZE",
      "who": "me"
    }
  ],
  "places": [
    {
      "name": "פראג",
      "code": "CZE",
      "lat": 49.7439,
      "lng": 15.3381,
      "who": "me",
      "album": "https://drive.google.com/drive/u/0/folders/16ew7w1pCK4C4SIxz2nipUd1x6MJkaq_W",
      "date": "2026-04"
    }
  ]
};
