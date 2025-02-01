// index.js
const registerButton = document.getElementById("registerButton");
const updateButton = document.getElementById("updateButton");

// recordId をグローバル変数として宣言
let recordId;

// 登録ボタンのクリックイベントリスナーを追加
// ※registerButtonがNullではない場合のみにイベントリスナーを追加
if (registerButton) {
	registerButton.addEventListener("click", () => {
		// ボタンがクリックされた時の処理
		const date = document.getElementById("date").value;
		const startTime = document.getElementById("start-time").value;
		const endTime = document.getElementById("end-time").value;
		const category = document.getElementById("category").value;

		if (date === "" || startTime === "" || endTime === "") {
			// if (date === undefined || startTime === undefined || endTime === undefined) {
			alert("日付、開始時間、終了時間は必須入力です。");
			return;
		} else {
			if (startTime >= endTime) {
				alert("開始時間は終了時間よりも前である必要があります。");
				return;
			}
		}

		// 入力値をオブジェクトにまとめる
		const record = {
			study_date: date,
			study_start_time: startTime,
			study_end_time: endTime,
			category: category,
		};

		registrRecord(record);
	});
}

// 修正登録ボタンのクリックイベントリスナーを追加
// ※updateButtonがNullではない場合のみにイベントリスナーを追加
if (updateButton) {
	updateButton.addEventListener("click", (event) => {
		// ボタンがクリックされた時の処理
		const date = document.getElementById("date").value;
		const startTime = document.getElementById("start-time").value;
		const endTime = document.getElementById("end-time").value;
		const category = document.getElementById("category").value;

		if (date === "" || startTime === "" || endTime === "") {
			// if (date === undefined || startTime === undefined || endTime === undefined) {
			alert("日付、開始時間、終了時間は必須入力です。");
			return;
		} else {
			if (startTime >= endTime) {
				alert("開始時間は終了時間よりも前である必要があります。");
				return;
			}
		}

		// 入力値をオブジェクトにまとめる
		const record = {
			study_date: date,
			study_start_time: startTime,
			study_end_time: endTime,
			category: category,
		};

		updateRecord(recordId, record);
	});
}

// 学習記録レコード登録
function registrRecord(record) {
	// APIサーバーにPOSTリクエストを送信
	fetch("http://localhost:8080/records", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(record),
		credentials: "include", // cookieを含めて送信
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			displayRecords(); // 登録後に学習記録一覧を更新

			document.getElementById("date").value = "";
			document.getElementById("start-time").value = "";
			document.getElementById("end-time").value = "";
			document.getElementById("category").value = "";

			updateButton.style.display = "none";
			registerButton.style.display = "inline-block";
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
			// TODO: エラー時の処理を追加 (例: エラーメッセージを表示する)
		});
}

// 学習記録レコード更新
function updateRecord(recordId, record) {
	fetch(`http://localhost:8080/records/${recordId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(record), // 修正前のレコードの情報を body に設定
		credentials: "include", // cookieを含めて送信
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			displayRecords(); // 学習記録一覧を更新

			document.getElementById("date").value = "";
			document.getElementById("start-time").value = "";
			document.getElementById("end-time").value = "";
			document.getElementById("category").value = "";

			updateButton.style.display = "none";
			registerButton.style.display = "inline-block";
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
		});
}

// 学習記録一覧を取得して表示
async function displayRecords() {
	try {
		const response = await fetch("http://localhost:8080/records", {
			credentials: "include", // cookieを含めて送信
		});
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const records = await response.json();

		const recordsContainer = document.querySelector(".records");
		recordsContainer.innerHTML = ""; // 既存のレコードをクリア

		// レコードが存在する場合のみ処理を行う
		if (records && records.length > 0) {
			// 取得したレコードをセット
			records.forEach((record) => {
				const recordElement = document.createElement("div");
				recordElement.classList.add("record");
				recordElement.innerHTML = `
                <span>${new Date(
					record.study_date
				).toLocaleDateString()} ${record.study_start_time.slice(
					11,
					16
				)}~${record.study_end_time.slice(11, 16)} (${
					record.category
				})</span>
                <button class="edit" data-id="${record.id}">修正</button>
                <button class="delete" data-id="${record.id}">削除</button>
            `;

				// 削除ボタンのクリックイベントリスナー
				const deleteButton = recordElement.querySelector(".delete");
				deleteButton.addEventListener("click", () => {
					const recordId = deleteButton.dataset.id; // data-id 属性からレコードIDを取得

					// 確認ダイアログを表示
					if (!confirm("本当に削除しますか？")) {
						return; // キャンセルされたら処理を中断
					}
					// API を呼び出してレコードを削除
					fetch(`http://localhost:8080/records/${recordId}`, {
						method: "DELETE",
						credentials: "include", // cookieを含めて送信
					})
						.then((response) => {
							if (!response.ok) {
								throw new Error("Network response was not ok");
							}
							return response.json();
						})
						.then((data) => {
							displayRecords(); // 学習記録一覧を更新
						})
						.catch((error) => {
							console.error("エラーが発生しました:", error);
						});
				});

				// 修正ボタンのクリックイベントリスナー
				const editButton = recordElement.querySelector(".edit");
				editButton.addEventListener("click", async () => {
					// 登録ボタンを非表示にし、修正登録ボタンを表示
					updateButton.style.display = "inline-block";
					registerButton.style.display = "none";
					// グローバル変数recordIdに値をセット
					recordId = editButton.dataset.id; // data-id 属性からレコードIDを取得

					try {
						// API を呼び出してレコードの詳細情報を取得
						const response = await fetch(
							`http://localhost:8080/records/${recordId}`,
							{
								credentials: "include", // cookieを含めて送信
							}
						);
						if (!response.ok) {
							throw new Error("Network response was not ok");
						}
						const record = await response.json();

						// 入力欄にレコードの情報をセット
						document.getElementById("date").value =
							record.study_date.slice(0, 10); // YYYY-MM-DD 形式に変換
						document.getElementById("start-time").value =
							record.study_start_time.slice(11, 16); // HH:mm 形式に変換
						document.getElementById("end-time").value =
							record.study_end_time.slice(11, 16); // HH:mm 形式に変換
						document.getElementById("category").value =
							record.category;
					} catch (error) {
						console.error("エラーが発生しました:", error);
					}
				});
				recordsContainer.appendChild(recordElement);
			});
		} else {
			// レコードが0件の場合の処理 
			const messageElement = document.createElement("p");
			messageElement.textContent = "学習記録はありません。";
			recordsContainer.appendChild(messageElement);
		}
	} catch (error) {
		console.error("エラーが発生しました:", error);
	}
}

// ページ読み込み時に学習記録一覧を表示
window.addEventListener("load", displayRecords);

// 学習成果を表示
function showResults() {
	// API を呼び出して学習成果を取得
	fetch("http://localhost:8080/results", {
		credentials: "include", // cookieを含めて送信
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((results) => {
			// グラフを描画
			const canvas = document.getElementById("learningGraph");
			const ctx = canvas.getContext("2d");
			new Chart(ctx, {
				type: "pie", // 円グラフ
				data: {
					labels: results.map((result) => result.category), // カテゴリ
					datasets: [
						{
							data: results.map((result) => result.totalTime), // 合計学習時間
							backgroundColor: [
								// グラフの色 (必要に応じて追加)
								"rgba(255, 99, 132, 0.2)",
								"rgba(54, 162, 235, 0.2)",
								"rgba(255, 206, 86, 0.2)",
								"rgba(75, 192, 192, 0.2)",
								"rgba(153, 102, 255, 0.2)",
								"rgba(255, 159, 64, 0.2)",
							],
							borderColor: [
								// グラフの枠線の色 (必要に応じて追加)
								"rgba(255, 99, 132, 1)",
								"rgba(54, 162, 235, 1)",
								"rgba(255, 206, 86, 1)",
								"rgba(75, 192, 192, 1)",
								"rgba(153, 102, 255, 1)",
								"rgba(255, 159, 64, 1)",
							],
							borderWidth: 1,
						},
					],
				},
			});

			// 学習成果を表示
			document.getElementById("results").style.display = "block";
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
		});
}

// 学習成果を非表示
function hideResults() {
	document.getElementById("results").style.display = "none";
}

// 認証処理
function auth() {
	const mode = document.getElementById("mode").value;
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	// メールアドレスまたはパスワードが空白の場合のバリデーション
	if (email === "" || password === "") {
		alert("メールアドレスとパスワードを入力してください。");
		return;
	}

	// API サーバーにリクエストを送信
	// fetch(mode === "login" ? "/login" : "/signin", {
	fetch(
		mode === "login"
			? "http://localhost:8080/login"
			: "http://localhost:8080/signin",
		{
			// モードに応じて URL を変更
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email: email, password: password }),
			credentials: "include", // cookieを含めて送信
		}
	)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			if (mode === "login") {
				// ログイン成功時の処理
				window.location.href = "index.html"; // index.html に遷移
			} else {
				// サインイン成功時の処理
				showLoginForm();
				alert("サインインに成功しました。");
			}
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
			alert("認証に失敗しました。");
		});
}

// ログアウト処理
function logout() {
	// API サーバーにログアウトリクエストを送信
	fetch("http://localhost:8080/logout", {
		method: "POST",
		credentials: "include", // cookieを含めて送信
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			window.location.href = "auth.html"; // auth.html に遷移
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
			// TODO: エラー時の処理 (例: エラーメッセージを表示)
			alert("ログアウトしました。");
		});
}
