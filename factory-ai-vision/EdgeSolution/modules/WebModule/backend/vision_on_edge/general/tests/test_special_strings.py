"""Special string/char that may cause error.
"""

# Special Chars
special_strings = [
    "",
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    ":",
    "_",
    "$",
    "^",
    "`",
    "&",
    "?",
    ".",
    ",",
    "'",
    '"',
    "#",
    ";",
    "\\",
    "/",
    "|",
]
special_strings += ["\n", "\t", "\r", "\a", "\f", "\v", "\b"]
special_strings += ["\1", "\2", "\3", "\4", "\5", "\6", "\7", "\0"]

# Parentheses
special_strings += ["(", ")", "()", ")("]
special_strings += ["[", "]", "[]", "]["]
special_strings += ["{", "}", "{}", "}{"]

# Regex
special_strings += ["[^]", "[A-Za-z]", "[^A-Za-f]", "s///g", "^.*$"]

# Math
special_strings += ["+", "-", "*", "/", "//", "%", "=", "=="]
special_strings += ["<", ">", ">=", "<=", "><", "<>", "<><", "><>"]
special_strings += ["+=", "-=", "*=", "/="]
