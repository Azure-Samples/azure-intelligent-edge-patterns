/**
 * set new web cookie. Encode values in case of special characters (IotHub connection strings always have semicolons, the typical cookie delimiter)
*/
function setCookie(cookieName, cookieValue, daysToLive=1) 
{
    //create time for cookie expiration
    var date = new Date();
    date.setTime(date.getTime() + (daysToLive * 24 * 60 * 60 * 1000));
    var expires = "expires=" + date.toGMTString();

    //if cookie contains a semicolon encode it so it doesn't break the cookie format
    if(cookieValue.includes(';')) cookieValue= encodeURIComponent(cookieValue);

    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

/** 
 * get cookie by name! (because "accio chocolatechip cookie dough" returns an error) 
*/
function getCookie(cookieName) 
{
    var name = cookieName + "=";
    var cookieArray = document.cookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) 
    {
        var cookie = decodeURIComponent(cookieArray[i]);
        while (cookie.charAt(0) == ' ') 
        {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) 
        {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

/** 
 * grab inputs from configuration. Currently set expiration to 1 day. Calls to connect to device and IotHub to make sure your credentials are valid!
*/
function setConfigCookies() 
{
    var payload =
    {
        "device-id": document.getElementById("device-id").value,
        "iothub-connection-string": document.getElementById("iothub-connection-string").value
    };

    setCookie("device-id", document.getElementById("device-id").value, 1);
    setCookie("iothub-connection-string", document.getElementById("iothub-connection-string").value, 1);

    var request = sendRequest(payload, "http://localhost:5000/hello");
  // event listener. Takes callback with an = or +=
    request.onreadystatechange = function () 
    {
        if (request.readyState == 4 && request.status == 200) 
        {
            document.getElementById("configuration-output-box").innerHTML = request.response;
        }
    }
}