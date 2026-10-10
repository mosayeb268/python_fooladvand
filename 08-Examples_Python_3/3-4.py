def rtd(**d):
    if "rate" in d and "distance" in d:
        d["time"] = d["distance"] / d["rate"]
    elif "time" in d and "distance" in d:
        d["rate"] = d["distance"] / d["time"]
    elif "rate" in d and "time" in d:
        d["distance"] = d["rate"] * d["time"]
    else:
        print(f"{d} kafi nist.")
    return d


# --------------------
print(f"{rtd(rate=120,distance=400)}")
print(f"{rtd(time=2,distance=1000)}")
