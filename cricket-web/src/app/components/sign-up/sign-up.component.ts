this.myFrom = this.fb.group({
  name: new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$'),
  ]),
  email: new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-z0-9](.?[a-z0-9]){5,}@g(oogle)?mail.com$'),
  ]),
  password: new FormControl('', [
    Validators.required,
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'), // Fixed pattern
  ]),
});
