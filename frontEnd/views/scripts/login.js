function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
        document.title="Create Account";
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
        document.title="Login";
    });

    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        // Perform your AJAX/Fetch login
        $(document).ready(function(){
            var emailUsername,pass;
            emailUsername=$("#emailUsername").val();
            pass=$("#password").val();

            $.post("/login",{emailUsername:emailUsername,pass:pass},function(data){
                if(data==='done') {
                    window.location.href="/plaid";
                }
                else
                    setFormMessage(loginForm, "error", "Invalid username or password");
            });
            
        });
    });
    createAccountForm.addEventListener("submit", e => {
        e.preventDefault();
        var data = {
            "username" : document.getElementById('signupUsername').value,
            "email" : document.getElementById('signupEmail').value,
            "password":  document.getElementById('signupPassword').value,
        }
        if(document.getElementById('signupPassword').value == document.getElementById('passwordConfirm').value) {
            fetch('/create_account', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(res => {
                if(res.ok) {
                    console.log(res.data)
                    url = res.data
                    //window.location.href = url;
                    
                }
                return false 
            });
        }
        else {
            setFormMessage(createAccountForm, "error", "Passwords do not match");
        }
    })

    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 6) {
                setInputError(inputElement, "Username must be at least 6 characters in length");
            }
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
});