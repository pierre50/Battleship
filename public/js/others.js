function raw(text){
    text=text.replaceAll("&amp;","&");
    text=text.replaceAll("&amp;","&");
    text=text.replaceAll("&lt;","<");
    text=text.replaceAll("&gt;",">");
    return text;
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
};

function isValid(str){
 return !/[@~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

function ImageExist(url) 
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}

function isImg(str) {
    if ( /\.(jpe?g|png|gif|bmp)$/i.test(str))
        return true;
    else
        return false;
}

function isURL(str) {
    var regex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g;
    var url = new RegExp(regex, 'i');
    return url.test(str);
}

function getURL(str) {
    var regex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g;
    var url = new RegExp(regex, 'i');
    var tab = str.split(regex);
    for (var i = 0 ; i < tab.length ; i++){
        if (url.test(tab[i]) == true) {
            console.log(tab[i]);
            if(isHTTP(tab[i]) == true)
                tab[i] = '<a target="_blank" href="http://'+tab[i]+'">'+tab[i]+'</a>';
            else
                tab[i] = '<a target="_blank" href="'+tab[i]+'">'+tab[i]+'</a>';
        }
    }
    return tab.join("");
}

function isHTTP(str) {
    var regex = new RegExp("^(http|https|ftp)://", "i");
    if (regex.test(str))
        return false;
    else
        return true;
}

function getCaret(el) { 
    if (el.selectionStart) { 
        return el.selectionStart; 
    } else if (document.selection) { 
        el.focus(); 
        var r = document.selection.createRange(); 
        if (r == null) { 
            return 0; 
        } 
        var re = el.createTextRange(), 
            rc = re.duplicate(); 
        re.moveToBookmark(r.getBookmark()); 
        rc.setEndPoint('EndToStart', re); 
        return rc.text.length; 
    }  
    return 0; 
}

