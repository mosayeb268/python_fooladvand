def BMI(height, weight):
    bmi = weight / (height**2)
    if bmi < 18.5:
        print(f"BMI={bmi}, Shoma *kambod* vazn darid.")
    elif bmi < 25:
        print(f"BMI={bmi:8.2f}, Shoma daraye vazn *Salamat* hastid.")
    elif bmi < 30:
        print(f"BMI={bmi}, Shoma *Ezafe* vazn darid.")
    else:
        print(f"BMI={bmi}, Shoma *chagh* hastid.")


# -----------------
h = float(input("Ghad ra vared konid:"))
w = float(input("Vazn ra vared konid:"))
# BMI(h,w)
BMI(weight=w, height=h)
