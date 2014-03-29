function messageHandler(request, sender, sendResponse)
{
    if(request.filenamePrefix && request.startingNumber)
    {
        console.log(request.filenamePrefix + '   ' + request.startingNumber);
        download(request.filenamePrefix, request.startingNumber);
    }
}

function download(filenamePrefix, startingNumber)
{
    var res = document.getElementsByTagName('script');
    if(res)
    {
        for(var i=0;i<res.length;i++)
        {
            if(res[i].text.match("var imageMeta"))
            {
                console.log(res[i].text);
                try
                {
                    eval(res[i].text);
                }
                catch(error)
                {
                    txt = "此页面存在一个错误，下载失败。\n\n";
                    txt += "错误描述: " + error.description + "\n\n";
                    alert(txt);
                    return;
                }
                break;
            }
        }
    }
    if(!imageMeta)
    {
        alert("不是有效的FamilySearch下载页面！");
        return;
    }

    var count = startingNumber;
    while(true)
    {
        var thisPicture = imageMeta.url;
        // pictureID is the "TH-1951-32077-9754-70" like part
        var pictureID = thisPicture.split('?')[0].split('/').pop();
        var pictureURL = "https://das.familysearch.org/das/v2/" + pictureID + 
                      "/$dist?ctx=CrxCtxPublicAccess&header=Content-Disposition&headerValue=attachment%3B%20filename%3Drecord-image.jpg";
        try
        {
            saveFile(filenamePrefix + '_' + count, pictureURL);
        }
        catch(error)
        {
            notifyUI("第" + count + "张图片下载失败");
            return;
        }
        notifyUI("第"+ count + "张图片下载完成");

        var nextPicture = undefined;
        for(var i=0; i < imageMeta.properties.length; i++)
        {
            if(imageMeta.properties[i].type ==
                    "org.familysearch.records.next_image")
            {
                nextPicture = imageMeta.properties[i].value;
                break;
            }
        }
        if(nextPicture)
        {
            var request = new XMLHttpRequest();
            try
            {
                request.open("GET", nextPicture, false);
                request.send();
                response = request.response;
            }
            catch(error)
            {
                notifyUI("第"+ (count+1) + "张图片下载失败");
                return;
            }
            var parser = new DOMParser();
            nextPage = parser.parseFromString(response, "text/html");
            var res = nextPage.getElementsByTagName('script');
            if(res)
            {
                for(var i=0;i<res.length;i++)
                {
                    if(res[i].text.match("var imageMeta"))
                    {
                        try
                        {
                            eval(res[i].text);
                        }
                        catch(error)
                        {
                            txt = "第" + (count+1) + "张图片下载失败。\n\n";
                            txt += "错误描述: " + error.description + "\n\n";
                            alert(txt);
                            return;
                        }
                        break;
                    }
                }
            }
        }
        else
        {
            notifyUI("下载全部完成");
            return;
        }

        count += 1;
    }   
}

function notifyUI(message)
{
    console.log(message);
    msg = {fsdMessage:message};
    chrome.runtime.sendMessage(msg);
}

function saveFile(filename, url)
// This function is downloaded from
// http://ausdemmaschinenraum.wordpress.com/2012/12/06/how-to-save-a-file-from-a-url-with-javascript/
{
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() 
    {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        delete a;
    }
    xhr.open('GET', url);
    xhr.send();
}

chrome.runtime.onMessage.addListener(messageHandler);
console.log('content script injected.');
