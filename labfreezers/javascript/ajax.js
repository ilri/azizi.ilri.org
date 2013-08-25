function ajax(source, target)
{
    var xmlhttp;
    if (window.XMLHttpRequest)
	{
	    xmlhttp=new XMLHttpRequest();
	}
    else if (window.ActiveXObject)
	{
	    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");   // code for IE6, IE5
	}
    else
	{
	    alert("Your browser does not support XMLHTTP!");
	}
    xmlhttp.onreadystatechange = function()
    {
	if(xmlhttp.readyState == 4)
	    {
		var output = document.getElementById(target);
		output.innerHTML = xmlhttp.responseText;
	    }
    }
    xmlhttp.open("GET", source, true);
    xmlhttp.send(null);
}