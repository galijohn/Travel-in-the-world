// =====================================================================
//  נתוני המפה. אפשר לערוך דרך edit.html, או ידנית כאן.
//
//  who: "together" (יחד) | "me" (אני) | "partner" (בת הזוג)
//       או רשימה, למשל ["me", "partner"] = כל אחד היה שם בנפרד
//  code: קוד מדינה בן 3 אותיות (ISR, ITA, FRA ...)
// =====================================================================

window.TRAVEL = {
  "people": {
    "me": {
      "name": "אני",
      "color": "#4cc9f0"
    },
    "partner": {
      "name": "זוגתי",
      "color": "#f72585"
    },
    "together": {
      "name": "יחד",
      "color": "#ffd166"
    }
  },
  "countries": [
    {
      "code": "ISR",
      "who": "together"
    },
    {
      "code": "ITA",
      "who": "together"
    },
    {
      "code": "GRC",
      "who": "together"
    },
    {
      "code": "THA",
      "who": "me"
    },
    {
      "code": "FRA",
      "who": "partner"
    },
    {
      "code": "USA",
      "who": [
        "me",
        "partner"
      ]
    }
  ],
  "places": []
};
