var myMap = new Map();

// configurando os valores
myMap.set("0", "!");
myMap.set("1", "@");
myMap.set("2", ",");
myMap.set("3", "$");
myMap.set("4", "%");
myMap.set("5", "&");
myMap.set("6", "*");
myMap.set("7", "(");
myMap.set("8", ".");
myMap.set("9", ")");

myMap.set("a", "'");
myMap.set("A", "_");
myMap.set("b", "+");
myMap.set("B", "=");
myMap.set("c", "[");
myMap.set("C", "{");
myMap.set("ç", "a");
myMap.set("Ç", "z");
myMap.set("d", "]");
myMap.set("D", "}");
myMap.set("e", ":");
myMap.set("E", ">");
myMap.set("f", ";");
myMap.set("F", "<");
myMap.set("g", "/");
myMap.set("G", "?");
myMap.set("h", "|");
myMap.set("H", "1");
myMap.set("i", "9");
myMap.set("I", "0");
myMap.set("j", "2");
myMap.set("J", "3");
myMap.set("k", "8");
myMap.set("K", "4");
myMap.set("l", "7");
myMap.set("L", "5");
myMap.set("m", "6");
myMap.set("M", "b");
myMap.set("n", "y");
myMap.set("N", "c");
myMap.set("o", "x");
myMap.set("O", "d");
myMap.set("p", "w");
myMap.set("P", "e");
myMap.set("q", "v");
myMap.set("Q", "f");
myMap.set("r", "g");
myMap.set("R", "u");
myMap.set("s", "h");
myMap.set("S", "t");
myMap.set("t", "i");
myMap.set("T", "s");
myMap.set("u", "j");
myMap.set("U", "r");
myMap.set("v", "l");
myMap.set("V", "q");
myMap.set("w", "m");
myMap.set("W", "£");
myMap.set("x", "n");
myMap.set("X", "¢");
myMap.set("y", "o");
myMap.set("Y", "§");
myMap.set("z", "p");
myMap.set("Z", "¬");

export function make (mat) {
    hash = "";

    for(let i=0; i<mat.length;i++){
        hash += myMap.get(mat.charAt(i))
    }
    console.log(hash);
    return hash;
};

