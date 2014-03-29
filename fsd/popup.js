chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse)
        {
            if(request.fsdMessage)
            {
                label = document.getElementById("status");
                label.innerText = request.fsdMessage;
            }            
        }
)

function getFilenamePrefix()
{
    var prefix = document.getElementById("filenamePrefix");
    return prefix.value;
}

function getStartingNumber()
{
    var startingNumber = document.getElementById("startingNumber");
    return parseInt(startingNumber.value);
}

function startDownloader()
{
    var prefix = getFilenamePrefix();
    localStorage.filenamePrefix = prefix;
    var number = getStartingNumber();
    localStorage.startingNumber = number;
    message = {filenamePrefix: prefix,
               startingNumber: number};
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
    console.log('startDownloader sent');
}

function init()
{
    var prefix = document.getElementById("filenamePrefix");
    if(localStorage.filenamePrefix == undefined)
        localStorage.filenamePrefix = "爱新觉罗";
    prefix.value = localStorage.filenamePrefix;

    var startingNumber = document.getElementById("startingNumber");
    if(localStorage.startingNumber == undefined)
        localStorage.startingNumber = 1;
    startingNumber.value = localStorage.startingNumber;

    var button = document.getElementById("start");
    button.onclick = startDownloader;
}

document.addEventListener('DOMContentLoaded', init);

