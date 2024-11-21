/** @type {import('tailwindcss').Config} */
module.exports = {
  content:["index.html"],
  plugins:[require('daisyui'),],
  theme: {
    extend: {
      fontFamily: {
       merriweather : ["Merriweather", "sans-serif"
       ], 
      },
      colors:{
        'primarycolor' : "#E8EAF6", 
        'primarygrey': "#767676",
      },
    },
  }
}

