var loginDiv = document.createElement('div');
loginDiv.setAttribute('id', 'loginDiv');
document.body.appendChild(loginDiv);

var userNameSpan = document.createElement('span');
userNameSpan.textContent = "Username: ";
loginDiv.appendChild(userNameSpan);

var br = document.createElement('br');
loginDiv.appendChild(br)

var userNameInput = document.createElement('input');
userNameInput.setAttribute('id', 'username');
loginDiv.appendChild(userNameInput);

var br = document.createElement('br');
loginDiv.appendChild(br)

var passwordSpan = document.createElement('span');
passwordSpan.textContent = "Password: ";
loginDiv.appendChild(passwordSpan);

var br = document.createElement('br');
loginDiv.appendChild(br)

var passwordInput = document.createElement('input');
passwordInput.setAttribute('type', 'password');
passwordInput.setAttribute('id', 'password');
loginDiv.appendChild(passwordInput);

var br = document.createElement('br');
loginDiv.appendChild(br)

var sendButton = document.createElement('button');
sendButton.textContent = 'Login';
sendButton.setAttribute('onclick', 'checkLogin()');
loginDiv.appendChild(sendButton);

function checkLogin(){
	var username = 'admin';
	var password = 'admin';
	if (userNameInput.value == username &
		passwordInput.value == password)
	{
		loginDiv.style.visibility = "hidden";
		profileDiv.style.visibility = "visible";
	}
	else
	{
		alert('invalid login');
	}
}

var profileDiv = document.createElement('div');
profileDiv.setAttribute('id', 'profileDiv');
profileDiv.style.visibility = "hidden";
document.body.appendChild(profileDiv);

var profileP1 = document.createElement('p');
profileP1.textContent = "My name is Roei Avrahami, I like to see to see good movies and programming ofc";
var profileP2 = document.createElement('p');
profileP2.textContent = "You can't blame gravity for falling in love. Albert Einstein";
profileDiv.appendChild(profileP1);
profileDiv.appendChild(profileP2);

var br = document.createElement('br');
profileDiv.appendChild(br);

var myImage = document.createElement('img');
myImage.setAttribute('src', 'myImage1.jpg');
myImage.setAttribute('width', 200);
myImage.setAttribute('height', 200);
myImage.onmouseover = function onmouse(){
	myImage.setAttribute('src', 'myImage2.jpg');
}
myImage.onmouseout = function outmouse(){
	myImage.setAttribute('src', 'myImage1.jpg');
}
profileDiv.appendChild(myImage);

var br = document.createElement('br');
profileDiv.appendChild(br);

var logoutButton = document.createElement('button');
logoutButton.textContent = 'Logout';
logoutButton.setAttribute('onclick', 'logout()');
profileDiv.appendChild(logoutButton);

function logout(){
	loginDiv.style.visibility = "visible";
	profileDiv.style.visibility = "hidden";
	alert('you logged out successfully');
}

var calcButton = document.createElement('button');
calcButton.textContent = 'Calculator';
calcButton.setAttribute('onclick', 'goCalc()');
profileDiv.appendChild(calcButton);

var calcDiv = document.createElement('div');
calcDiv.setAttribute('id', 'calcDiv');
calcDiv.style.visibility = "hidden";
document.body.appendChild(calcDiv);

var counter = 0;

function goCalc(){
	profileDiv.style.visibility = "hidden";
	calcDiv.style.visibility = "visible";
	addCalcDiv = document.createElement('div');
	addCalcDiv.setAttribute('id', addCalcDiv);
	addCalcDiv.setAttribute('align', 'center');
	calcDiv.appendChild(addCalcDiv);
	var calcButton = document.createElement("Button");
	calcButton.textContent = "Add Calculator";
	calcButton.setAttribute('onclick', 'newCalc()');
	addCalcDiv.appendChild(calcButton);
	newCalc();
}

function newCalc(){
	counter++;
	singleCalcDiv = document.createElement('div');
	singleCalcDiv.setAttribute('id', counter);
	singleCalcDiv.setAttribute('align', 'center');
	calcDiv.appendChild(singleCalcDiv);

	singleCalcDiv.writeToScreen = function(sign){
		this.firstChild.value += sign;
		};

	singleCalcDiv.equals = function(){
		var v = eval(this.firstChild.value);
		this.firstChild.value = v;
	}

	screen = document.createElement("INPUT");
	screen.setAttribute("type", "text");
	screen.setAttribute("id", "screen");
	singleCalcDiv.appendChild(screen);

	var br = document.createElement('br');
	singleCalcDiv.appendChild(br)

	var calcButton = document.createElement("Button");
	calcButton.textContent = "1";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(1)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "2";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(2)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "3";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(3)');
	singleCalcDiv.appendChild(calcButton);

	var br = document.createElement('br');
	singleCalcDiv.appendChild(br)

	var calcButton = document.createElement("Button");
	calcButton.textContent = "4";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(4)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "5";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(5)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "6";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(6)');
	singleCalcDiv.appendChild(calcButton);

	var br = document.createElement('br');
	singleCalcDiv.appendChild(br)

	var calcButton = document.createElement("Button");
	calcButton.textContent = "7";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(7)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "8";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(8)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "9";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(9)');
	singleCalcDiv.appendChild(calcButton);

	var br = document.createElement('br');
	singleCalcDiv.appendChild(br)

	var calcButton = document.createElement("Button");
	calcButton.textContent = "+";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen("+")');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "0";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(0)');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "-";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen("-")');
	singleCalcDiv.appendChild(calcButton);

	var br = document.createElement('br');
	singleCalcDiv.appendChild(br)

	var calcButton = document.createElement("Button");
	calcButton.textContent = "/";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen("/")');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = "*";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen("*")');
	singleCalcDiv.appendChild(calcButton);

	var calcButton = document.createElement("Button");
	calcButton.textContent = ".";
	calcButton.setAttribute('onclick', 'parentNode.writeToScreen(".")');
	singleCalcDiv.appendChild(calcButton);

	var br = document.createElement('br');
	singleCalcDiv.appendChild(br)

	var calcButton = document.createElement("Button");
	calcButton.textContent = "=";
	calcButton.setAttribute('onclick', 'parentNode.equals()');
	singleCalcDiv.appendChild(calcButton);
}