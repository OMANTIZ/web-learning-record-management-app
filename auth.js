// auth.js

// ログイン処理
function login() {
	const email = document.getElementById("loginEmail").value;
	const password = document.getElementById("loginPassword").value;

	// API サーバーにログインリクエストを送信
	fetch("/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email: email, password: password }),
		credentials: "include", // cookieを含めて送信
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			// ログイン成功時の処理
			//document.getElementById("learningInput").style.display = "block"; // 学習時間の入力欄を表示
			window.location.href = "index.html";
			alert("ログインに成功しました。");
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
			// エラー時の処理: エラーメッセージを表示
			alert("ログインに失敗しました。"); // 失敗メッセージを表示
		});
}

// サインイン処理
function signin() {
	const email = document.getElementById("signinEmail").value;
	const password = document.getElementById("signinPassword").value;

	// API サーバーにサインインリクエストを送信
	fetch("/signin", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email: email, password: password }),
		credentials: "include", // cookieを含めて送信
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			// サインイン成功時の処理
			showLoginForm(); // ログインフォームを表示する関数を呼び出す
			alert("サインインに成功しました。"); // 成功メッセージを表示
		})
		.catch((error) => {
			console.error("エラーが発生しました:", error);
			// エラー時の処理: エラーメッセージを表示
			alert("サインインに失敗しました。"); // 失敗メッセージを表示
		});
}

// 認証処理
async function auth() {
    const mode = document.getElementById("mode").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // メールアドレスまたはパスワードが空白の場合のバリデーション
    if (email === "" || password === "") {
        alert("メールアドレスとパスワードを入力してください。");
        return;
    }

    try {
        const response = await fetch(
            mode === "login"
                ? "http://localhost:8080/login"
                : "http://localhost:8080/signin",
            {
                // モードに応じて URL を変更
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
                credentials: "include", // cookieを含めて送信
            }
        );

        if (!response.ok) {
            // レスポンスが失敗した場合、エラーレスポンスのJSONを取得
            try {
                const errorData = await response.json();
                // エラーメッセージを表示
                if (errorData.error) {
                    alert(errorData.error);
                } else {
                    alert("認証に失敗しました。");
                }
            } catch (jsonError) {
                // JSONのパースに失敗した場合は、デフォルトのエラーメッセージを表示
                console.error("JSON parse error:", jsonError);
                alert("認証に失敗しました。");
            }
            return; // エラーが発生した場合はここで処理を終了
        }

        const data = await response.json();

        if (mode === "login") {
            // ログイン成功時の処理
            console.log("ログイン成功:", data); // ログ出力
            window.location.href = "index.html"; // index.html に遷移
        } else {
            // サインイン成功時の処理
            console.log("サインイン成功:", data); // ログ出力
            
			document.getElementById("mode").value = "login"
			document.getElementById("email").value = ""
			document.getElementById("password").value = ""
            alert("サインインに成功しました。");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("認証に失敗しました。");
    }
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
