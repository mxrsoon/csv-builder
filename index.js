// Universal Module Definition (UMD).
// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.CSVBuilder = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
    function escapeCell(data, options) {
        // Default options
        options = Object.assign({
            charLimit: 249,
            decimalSeparator: ","
        }, options);

        if (typeof(data) === "number") {
            // Convert to string and replace decimal separator
            return String(data).replace(/\./g, options.decimalSeparator);
        } else {
            // Convert to string and escape quotes
            data = String(typeof(data) === "undefined" ? "" : data).replace(/\"/g, `""`);

            // Apply character limit subtracted by cell-escaping characters length (except outer quotes)
            if (data.length > options.charLimit - 5) {
                data = data.substr(0, options.charLimit - 5);

                // Check if broke quotes escape sequence
                if (data[data.length - 1] === '"' && data[data.length - 2] !== '"') {
                    // Remove broken escape sequence
                    data = data.substr(0, data.length - 1);
                }
            }

            // Apply escaping characters and force parsing as string
            return `"=""${data}"""`;
        }
    }

    const dataMap = new WeakMap();

    class CSVBuilder {
        constructor() {
            dataMap.set(this, "");
        }

        get data() {
            return dataMap.get(this);
        }

        append(...data) {
            let dataString = this.data;

            for (let item of data) {
                if (dataString.length !== 0 && dataString[dataString.length - 1] !== "\n") {
                    // Not first item of current line
                    dataString += ";";
                }

                dataString += escapeCell(item);
            }

            dataMap.set(this, dataString);
        }

        appendLine(data = []) {
            if (!Array.isArray(data)) {
                data = [data];
            }
            
            const dataString = this.data;
            
            if (dataString.length !== 0 && dataString[dataString.length - 1] !== "\n") {
                // Not on empty line
                this.newLine();
            }

            this.append(...data);
            this.newLine();
        }

        newLine() {
            dataMap.set(this, this.data + "\n");
        }

        toString() {
            return this.data;
        }
    }

    return CSVBuilder;
}));