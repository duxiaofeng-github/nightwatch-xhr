export const clientListen = function () {
    const rand = () => Math.random() * 16 | 0;
    const uuidV4 = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, c => (
                (c === 'x'
                        ? rand()
                        : rand() & 0x3 | 0x8
                ).toString(16)
            ));
    const getXhrListen = function() {
        let xhrListen;
    
        try {
            const nightWatchXhrCache =
            window.localStorage.getItem("nightWatchXhr") || "";
            xhrListen = JSON.parse(nightWatchXhrCache);
        } catch (e) {}
    
        return xhrListen || [];
    };
    const setXhrListen = function(xhrListen) {
        try {
            window.localStorage.setItem("nightWatchXhr", JSON.stringify(xhrListen));
        } catch (e) {}
    };
            

    setXhrListen([]);

    if (!XMLHttpRequest.customized) {
        XMLHttpRequest.realSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.realOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (method, url) {
            this.id = uuidV4();

            const xhrListen = getXhrListen();

            xhrListen.push({
                id: this.id,
                method,
                url,
                openedTime: Date.now()
            });

            setXhrListen(xhrListen);

            this.onloadend = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    const xhrs = getXhrListen();
                    const xhr = xhrs.find(item => this.id === item.id);

                    if (xhr) {
                        xhr.httpResponseCode = this.status;
                        xhr.responseData = this.response;
                        if (this.response instanceof Blob) {
                            this.response.text().then(function (text) {
                                xhr.responseText = text;
                                
                                setXhrListen(xhrs);
                            });
                        } else if (typeof this.responseText === "string") {
                            xhr.responseText = this.responseText;
                        }
                        xhr.status = (this.status === 200 ? 'success' : 'error');
                        xhr.responseHeaders = this.getAllResponseHeaders();
                    }

                    setXhrListen(xhrs);
                }
            };
            XMLHttpRequest.realOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function (data) {
            const xhrs = getXhrListen();
            const xhr = xhrs.find(item => this.id === item.id);

            if (xhr) {
                xhr.requestData = data;
            }

            setXhrListen(xhrs);

            XMLHttpRequest.realSend.apply(this, arguments);
        };
        XMLHttpRequest.customized = true;
    }
};

export const clientPoll = function () {
    const getXhrListen = function() {
        let xhrListen;
    
        try {
          const nightWatchXhrCache =
            window.localStorage.getItem("nightWatchXhr") || "";
          xhrListen = JSON.parse(nightWatchXhrCache);
        } catch (e) {}
    
        return xhrListen || [];
    };
    
    return getXhrListen();
};
