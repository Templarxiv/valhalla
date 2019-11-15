var connect = async (port) => {
    console.log("123");
    const response = await fetch('/connect');
    const myJson = await response.text();
    console.log(myJson);
}
var disconnect = async (port) => {
    console.log("123");
    const response = await fetch('/disconnect');
    const myJson = await response.text();
    console.log(myJson);
}
var print = async () => {
    var text = document.getElementById("LCDText");
    const response = await fetch('/print', { text: text });
    const myJson = await response.text();
    console.log(myJson);
}