var myMap = new Map();

// configurando os valores
myMap.set("!", "0");
myMap.set("@", "1");
myMap.set(",", "2");
myMap.set("$", "3");
myMap.set("%", "4");
myMap.set("&", "5");
myMap.set("*", "6");
myMap.set("(", "7");
myMap.set(".", "8");
myMap.set(")", "9");

myMap.set("'", "a");
myMap.set("_", "A");
myMap.set("+", "b");
myMap.set("=", "B");
myMap.set("[", "c");
myMap.set("{", "C");
myMap.set("a", "ç");
myMap.set("z", "Ç");
myMap.set("]", "d");
myMap.set("}", "D");
myMap.set(":", "e");
myMap.set(">", "E");
myMap.set(";", "f");
myMap.set("<", "F");
myMap.set("/", "g");
myMap.set("?", "G");
myMap.set("|", "h");
myMap.set("1", "H");
myMap.set("9", "i");
myMap.set("0", "I");
myMap.set("2", "j");
myMap.set("3", "J");
myMap.set("8", "k");
myMap.set("4", "K");
myMap.set("7", "l");
myMap.set("5", "L");
myMap.set("6", "m");
myMap.set("b", "M");
myMap.set("y", "n");
myMap.set("c", "N");
myMap.set("x", "o");
myMap.set("d", "O");
myMap.set("w", "p");
myMap.set("e", "P");
myMap.set("v", "q");
myMap.set("f", "Q");
myMap.set("g", "r");
myMap.set("u", "R");
myMap.set("h", "s");
myMap.set("t", "S");
myMap.set("i", "t");
myMap.set("s", "T");
myMap.set("j", "u");
myMap.set("r", "U");
myMap.set("l", "v");
myMap.set("q", "V");
myMap.set("m", "w");
myMap.set("£", "W");
myMap.set("n", "x");
myMap.set("¢", "X");
myMap.set("o", "y");
myMap.set("§", "Y");
myMap.set("p", "z");
myMap.set("¬", "Z");

const make = (mat) => {
    hash = "";

    for(let i=0; i<mat.length;i++){
        hash += myMap.get(mat.charAt(i))
    }
    
    return hash;
};

module.exports = {
    make: make
};