def func1():
    print(msg)


# --------
def func2():
    global msg
    msg = "I am in function2"
    print(msg)


# --------
msg = "I like python programming."
func1()  # "I like python programming."
func2()  # "I am in function2"
print("After calling func2:")
print(msg)  # "I am in function2"
