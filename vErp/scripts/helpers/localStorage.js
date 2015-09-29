function getItemLocalStorage(localStorageKey) {
    return window.localStorage.getItem(localStorageKey);
}

function removeItemLocalStorage(localStorageKey) {
    window.localStorage.removeItem(localStorageKey);
}

function setItemLocalStorage(localStorageKey, localStorageValue) {
    window.localStorage.setItem(localStorageKey, localStorageValue);
}

function clearStorage() {
    removeItemLocalStorage('SessionId');
    removeItemLocalStorage('UserId');
    removeItemLocalStorage('LoggedOnUser');
}


function getXmlPath() {
    return xmlConfig.xmlPath;
}

