def compare(*numbers, case):
    if case == True:
        result = findMax(numbers)
    else:
        result = findMin(numbers)
    return result


# ----------------------------
def findMin(numbers):
    my_min = numbers[0]
    for item in numbers[1:]:
        if item < my_min:
            my_min = item
    return my_min


# ------------------------------
def findMax(numbers):
    my_max = numbers[0]
    for item in numbers[1:]:
        if item > my_max:
            my_max = item
    return my_max


# ------------------------------
# def compare(*numbers, case):
print(f"{compare(23,45,90,-2,0,33,345,80,case=True)}")
print(f"{compare(23,45,90,-2,0,33,345,80,case=False)}")
