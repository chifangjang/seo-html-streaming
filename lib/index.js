const HtmlParser = require("atlas-html-stream");
const path = require('path');
const fs = require("fs");
const INPUT_FILE_PATH = path.join(__dirname, '..', 'sample', 'ted.html');
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'sample', 'report.txt');

let seoParse = {
	_rules: [],
	_console: false,
	_file: INPUT_FILE_PATH,
	_output: OUTPUT_FILE_PATH,
	parse: function () {

		let rules = this._rules;
		const htmlfile = fs.createReadStream(this._file);

		htmlfile.pipe(new HtmlParser()).on("data", ({ name, data, text }) => {
			if (name && data) {
				rules.map((rule, index) => {
					if (rule.tag == name) {
						let atrib = rule.atribs;
						if (atrib) {
							if (rule._value) {
								Object.keys(atrib).map((key) => {
									Object.keys(atrib[key]).map((value) => {
										if (data[key] == value) {
											rules[index]["atribs"][key][value] += 1;
										}});});
							} else {
								if (!data.hasOwnProperty(atrib)) {
									rules[index]["count"] += 1;
								}}
						} else {
							rules[index]["count"] += 1;
						}}})
			}

		}).on("end", () => {

			let str = "";
			Promise.all (
				rules.map(rule => this.getResult(rule))
			).then((result) => {
				result.map((r) => { str += r; });
				return str ;
			}).then((str) => {
				if (this._console) console.log(`Result: \n${str}`);

				fs.writeFile(this._output, str, function (err) {
					if (err) return console.log(err);
					console.log('Wrote in file, please check it');
				});
			})
		})
		return this;
	},
	getResult: function (rule) {
		let str = "";

		return new Promise((resolve,reject) => {
			let oper = rule.valid.operate,
			num = rule.valid.num;
			atrib = rule.atribs;
			
			if (atrib) {
				if (rule._value) {
					Object.keys(atrib).map((key) => {
						Object.keys(atrib[key]).map((value) => {
							if (this.operator[oper](atrib[key][value], num)) {
								str += this.resultSentence(rule.tag, [key], [value], oper, num);
								resolve(str);
							}});})
				} else {
					Object.keys(atrib).map((key) => {
						if (this.operator[oper](key, num)) {
							str += this.resultSentence(rule.tag, [atrib, rule.count], [], oper, num);
							resolve(str);
						}})
				}
			} else {
				if (this.operator[oper](rule.count, num)) {
					str += this.resultSentence(rule.tag, [], [], oper, num);
					resolve(str);}
			}
			resolve(str);
		})
	},
	resultSentence: function (tag, key, value, oper, num) {

		let str = "";
		if (oper == "=" && num == 0) {
			if (key.length === 0) {
				str += `The HTML without <${tag}> \n`;
			} else if (value.length === 0) {
				str += `The are ${key[1]} <${tag}> without attribute ${key[0]} \n`;
			} else {
				str += `The HTML without <${tag} ${key[0]}=${value}> \n`;
			}

		} else if (oper == ">") {
			str += `The HTML have more than ${num} <${tag}> \n`;
		}

		return str;
	},
	operator: {
		'<': function (a, b) { return a < b; },
		'=': function (a, b) { return a == b; },
		'<=': function (a, b) { return a <= b; },
		'>': function (a, b) { return a > b; },
		'>=': function (a, b) { return a >= b; },
	},
	_error: {
		format: `   it need to be array & string & muber !!
		ex: .rule(['meta'],'=',0) \n`
	},
	rule: function (node, operator, criteria) {

		let rule = {
			"tag": node[0],
			"valid": {
				"operate": operator,
				"num": criteria
			}
		}

		if (node === void (0)) {
			return this._rule;
		} else {
			if (node instanceof Array) {

				if (1 == node.length) {
					rule["count"] = 0;
					rule["atribs"] = false;
				} else if (2 == node.length) {
					rule["atribs"] = [node[1]];
					rule["count"] = 0;
				} else if (3 == node.length) {
					rule["atribs"] = {};
					rule["_value"] = true;
					rule["atribs"][node[1]] = {};
					rule["atribs"][node[1]][node[2]] = 0;
				}

				this._rules.push(rule);
			} else {
				throw this._error.format;
			}

			return this;
		}
	},
	setConsole: function (cli) {
		if (cli === void (0)) {
			return this._console;
		} else {
			this._console = cli;
			return this;
		}
	},
	setPath: function (file) {
		if (file === void (0)) {
			return this._file;
		} else {
			this._file = file;
			return this;
		}
	},
	setOutput: function (output) {
		if (output === void (0)) {
			return this._output;
		} else {
			this._output = output;
			return this;
		}
	}
};

module.exports = seoParse;