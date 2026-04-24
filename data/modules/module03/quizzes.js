/* ================================================================
   Module 3 Quizzes — 5 questions per chapter
   ================================================================ */
Object.assign(QUIZZES, {

  'ch12': {
    title: 'Chapter 12 Quiz: Structs & Methods',
    questions: [
      {
        q: 'What does &self mean in a method signature inside an impl block?',
        options: [
          'It transfers ownership of the struct into the method',
          'It borrows the struct instance immutably so the method can read but not modify its fields',
          'It borrows the struct instance mutably so the method can change its fields',
          'It creates a copy of the struct for use inside the method'
        ],
        answer: 1,
        explanation: '&self is an immutable borrow of the struct instance. The method can read the struct\'s fields but cannot change them. To change fields, the method must use &mut self instead.'
      },
      {
        q: 'What must you add above a struct definition to make it printable with {:?}?',
        options: [
          '#[allow(print)]',
          'impl Display for MyStruct { }',
          '#[derive(Debug)]',
          'use std::fmt::Debug;'
        ],
        answer: 2,
        explanation: '#[derive(Debug)] is a compiler attribute that automatically generates the Debug trait implementation for the struct, which is what {:?} uses. Without it, the compiler refuses to format the struct.'
      },
      {
        q: 'You call rect.scale(2) where scale is defined as fn scale(&mut self, factor: u32). The variable rect was declared as let rect = ...; without mut. What happens?',
        options: [
          'The method runs but its changes are silently discarded',
          'The program compiles and panics at runtime when scale is called',
          'The compiler produces an error: cannot borrow rect as mutable because it is not declared as mutable',
          'Rust automatically makes the binding mutable for the duration of the call'
        ],
        answer: 2,
        explanation: 'To call a method that takes &mut self, the struct instance must be declared with mut. Rust enforces mutability at compile time; there is no runtime fallback. The fix is to write let mut rect = ...'
      },
      {
        q: 'What is the struct update syntax (..) used for?',
        options: [
          'Iterating over all fields in a struct',
          'Creating a new instance while copying any unspecified fields from an existing instance',
          'Comparing two struct instances for equality',
          'Merging two structs by combining their fields into one'
        ],
        answer: 1,
        explanation: 'The ..existing syntax fills in all fields you did not explicitly specify by copying them from an existing instance. For example: Rectangle { width: 100, ..original } creates a new Rectangle with width=100 and all other fields taken from original.'
      },
      {
        q: 'Which of these is a valid struct definition and instantiation in Rust?',
        options: [
          'struct Point(x: i32, y: i32); let p = Point(1, 2);',
          'struct Point { x: i32, y: i32 } let p = Point { x: 1, y: 2 };',
          'struct Point { x, y: i32 } let p = Point { 1, 2 };',
          'struct Point = { x: i32, y: i32 }; let p = new Point(1, 2);'
        ],
        answer: 1,
        explanation: 'A struct definition uses the struct keyword, a PascalCase name, and typed fields in curly braces (field: Type). An instance is created by naming each field explicitly (field: value). There is no new keyword in Rust.'
      }
    ]
  },


  'ch13': {
    title: 'Chapter 13 Quiz: Associated Functions',
    questions: [
      {
        q: 'How do you call an associated function named new on a type called Circle?',
        options: [
          'new.Circle(5.0)',
          'Circle.new(5.0)',
          'Circle::new(5.0)',
          'self::Circle::new(5.0)'
        ],
        answer: 2,
        explanation: 'Associated functions are called using the double-colon :: syntax on the type name: TypeName::function_name(). The dot notation (circle.new()) is only for methods that take self, and calling new() that way would require an existing instance, which defeats the purpose.'
      },
      {
        q: 'What is the key difference between an associated function and a method in Rust?',
        options: [
          'Associated functions are always public; methods can be private',
          'Methods can be called with :: syntax; associated functions use dot notation',
          'An associated function has no self, &self, or &mut self parameter; a method has one of these',
          'Associated functions are defined in a separate impl block from methods'
        ],
        answer: 2,
        explanation: 'The defining difference is whether the first parameter is self-related. Methods take self, &self, or &mut self and are called on an instance (dot notation). Associated functions have no self parameter and are called on the type itself (:: notation).'
      },
      {
        q: 'Inside an impl Rectangle block, what does the type alias Self (capital S) refer to?',
        options: [
          'The current function being defined',
          'The parent module that contains Rectangle',
          'The type Rectangle itself (the type the impl block is for)',
          'A special constructor keyword that replaces new'
        ],
        answer: 2,
        explanation: 'Inside any impl block, Self is an alias for the type being implemented. So inside impl Rectangle, Self means Rectangle. Using Self instead of the concrete type name makes the code easier to maintain: if you rename the struct, you only change the struct line.'
      },
      {
        q: 'Why does Rust use named associated functions like Rectangle::square() instead of constructor overloading like some other languages?',
        options: [
          'Because Rust cannot differentiate functions by parameter types',
          'Because named constructors are self-documenting: the name explains what kind of instance is created, not just how it is specified',
          'Because overloaded constructors would break the borrow checker',
          'Because associated functions run faster than overloaded constructors at runtime'
        ],
        answer: 1,
        explanation: 'Rectangle::square(25) communicates intent: you want a square. Rectangle::new(25, 25) just says "two equal numbers" without explaining why. Named constructors also prevent ambiguity when two constructors could have the same parameter types but different meanings.'
      },
      {
        q: 'From Chapter 12: you want to write a method that modifies the struct\'s own data (e.g., doubles the width). Which signature is correct?',
        options: [
          'fn double_width(self)',
          'fn double_width(&self)',
          'fn double_width(&mut self)',
          'fn double_width(mut self)'
        ],
        answer: 2,
        explanation: '&mut self borrows the struct mutably, allowing the method to read and modify the struct\'s fields without taking ownership. &self is read-only. self (without &) would move ownership into the method, consuming the instance. mut self would also move ownership but allow the method to reassign its own local copy.'
      }
    ]
  },


  'ch14': {
    title: 'Chapter 14 Quiz: Enums & Option',
    questions: [
      {
        q: 'What does the Option<T> type represent in Rust?',
        options: [
          'A value that may be one of several numeric types',
          'A value that is either Some(T) — it exists — or None — it does not exist',
          'A type similar to a nullable pointer that can be dereferenced unsafely',
          'An optional type annotation; you can omit it if the type can be inferred'
        ],
        answer: 1,
        explanation: 'Option<T> is an enum with two variants: Some(T) wraps a value of type T when it exists, and None signals that no value is present. Unlike null in other languages, Rust forces you to handle both cases explicitly before using the value.'
      },
      {
        q: 'Given: let x: Option<i32> = Some(42); can you use x directly in arithmetic like x * 2?',
        options: [
          'Yes, Rust automatically unwraps Option in arithmetic contexts',
          'Yes, Some(42) is identical to the integer 42 for arithmetic purposes',
          'No: x is an Option<i32>, not an i32. You must extract the inner value first with match, if let, or unwrap',
          'No: you must first call x.to_i32() to convert it'
        ],
        answer: 2,
        explanation: 'Option<i32> and i32 are completely different types. The wrapper does not disappear automatically. You must extract the value using match, if let Some(n) = x, x.unwrap(), or x.unwrap_or(default) before doing arithmetic.'
      },
      {
        q: 'What happens if you call .unwrap() on a None value?',
        options: [
          'It returns the default zero value for the type (0 for integers, empty string for String)',
          'It silently does nothing and returns None again',
          'The program panics at runtime with a message like "called unwrap on a None value"',
          'The compiler detects it and produces a compile error'
        ],
        answer: 2,
        explanation: 'unwrap() on None causes an immediate runtime panic, crashing the program. The compiler cannot always detect this at compile time. Use match or if let for safe handling, or unwrap_or(default_value) if you want a fallback.'
      },
      {
        q: 'Which of these is a valid enum definition where variants carry different kinds of data?',
        options: [
          'enum Shape { Circle(f64), Square(f64), Rectangle(f64, f64) }',
          'enum Shape { Circle: f64, Square: f64, Rectangle: (f64, f64) }',
          'enum Shape = Circle(f64) | Square(f64) | Rectangle(f64, f64);',
          'enum Shape { Circle { f64 }, Square { f64 } }'
        ],
        answer: 0,
        explanation: 'Enum variants can hold tuple-style data by listing types in parentheses after the variant name. Circle(f64) holds one f64, Rectangle(f64, f64) holds two. Option A is the correct syntax. Option D is almost right but needs a field name: Circle { radius: f64 }.'
      },
      {
        q: 'From Chapter 13: you have struct Circle and want to provide a constructor. Which call is correct when creating a Circle with radius 5.0?',
        options: [
          'circle.new(5.0)',
          'new::Circle(5.0)',
          'Circle::new(5.0)',
          'Circle.create(5.0)'
        ],
        answer: 2,
        explanation: 'Associated functions (constructors) are called using the Type::function() syntax. new() is just a conventional name for the primary constructor. Dot notation (circle.new()) is only for methods that operate on an existing instance.'
      }
    ]
  },


  'ch15': {
    title: 'Chapter 15 Quiz: Match Expressions',
    questions: [
      {
        q: 'What does "exhaustive" mean in the context of a Rust match expression?',
        options: [
          'Every arm must have the same return type',
          'Every possible value of the matched type must be handled by at least one arm',
          'The match expression must contain at least three arms',
          'The match must use the _ wildcard as its final arm'
        ],
        answer: 1,
        explanation: 'Exhaustiveness means the compiler verifies that every possible value of the matched type has a corresponding arm. If you miss a case, the program will not compile. This prevents silent unhandled states and is especially powerful with enums: adding a new variant forces you to update every match.'
      },
      {
        q: 'What does this code print?\n\nlet x = 7;\nlet label = match x {\n    1 | 2 | 3 => "small",\n    4..=6     => "medium",\n    n if n % 2 == 0 => "large even",\n    _         => "large odd",\n};\nprintln!("{}", label);',
        options: [
          'small',
          'medium',
          'large even',
          'large odd'
        ],
        answer: 3,
        explanation: 'x is 7. The first arm covers 1, 2, 3 — no match. The second covers 4 through 6 — no match. The third is a match guard: 7 % 2 == 1, not 0, so the guard fails. The wildcard _ catches 7. Output is "large odd".'
      },
      {
        q: 'When should you prefer if let over a full match expression?',
        options: [
          'When matching on a boolean value',
          'When you only care about one pattern and want to ignore all others without writing a verbose _ => {} catch-all',
          'When the match expression needs to return a value',
          'When the matched type is a struct rather than an enum'
        ],
        answer: 1,
        explanation: 'if let is syntactic sugar for a match with one meaningful arm and a do-nothing catch-all. Use it when you only care whether a value matches one specific pattern. When you need to handle multiple cases, a full match is clearer.'
      },
      {
        q: 'What is a match guard in Rust?',
        options: [
          'A compiler attribute that disables exhaustiveness checking for a match',
          'The _ wildcard pattern used as the final arm',
          'An extra if condition appended to a match arm pattern that further restricts when the arm fires',
          'A keyword that exits the current match early, like break in a loop'
        ],
        answer: 2,
        explanation: 'A match guard is written as pattern if condition => body. The arm only fires if the pattern matches AND the condition evaluates to true. Guards let you express conditions that cannot be encoded in a pure pattern, such as "any even number" or "any value greater than 100".'
      },
      {
        q: 'From Chapter 14: what is the fundamental difference between None and Some(0) in Option<i32>?',
        options: [
          'They are identical; None is just a shorthand alias for Some(0)',
          'None means no value exists at all; Some(0) means a value exists and its value happens to be zero',
          'None causes a panic if matched; Some(0) is always safe',
          'None is a keyword; Some(0) requires an import from std::option'
        ],
        answer: 1,
        explanation: 'None represents the complete absence of a value — "nothing is here." Some(0) means a value is present and its content is 0. Treating them as the same would confuse "no result found" with "the result is zero," which are meaningfully different in almost every real program.'
      }
    ]
  },


  'ch16': {
    title: 'Chapter 16 Quiz: Pattern Destructuring',
    questions: [
      {
        q: 'What does this code print?\n\nlet (a, b, c) = (10, "hello", true);\nprintln!("{} {} {}", a, b, c);',
        options: [
          '(10, "hello", true)',
          '10 hello true',
          'A compile error: mixed types cannot be destructured',
          'A runtime panic'
        ],
        answer: 1,
        explanation: 'Tuple destructuring unpacks each element into its own variable regardless of type. a gets 10 (i32), b gets "hello" (&str), c gets true (bool). The println! then formats them with spaces between, producing: 10 hello true.'
      },
      {
        q: 'You have struct Point { x: i32, y: i32 } and want to destructure a Point p into variables named px and py. Which syntax is correct?',
        options: [
          'let Point { x: px, y: py } = p;',
          'let Point { px: x, py: y } = p;',
          'let (px, py) = p;',
          'let { px, py } = p;'
        ],
        answer: 0,
        explanation: 'In struct destructuring, the syntax field: new_name renames the field. x: px means "take the field named x and bind it to the variable px". The colon goes field-name : new-variable-name, not the other way around.'
      },
      {
        q: 'What does the .. operator do when used in a struct pattern like let Player { name, .. } = player;?',
        options: [
          'It copies the entire struct into the current scope as a separate variable',
          'It ignores all fields that are not explicitly named in the pattern',
          'It is a range operator that iterates over all fields',
          'It merges the struct with another struct'
        ],
        answer: 1,
        explanation: '.. in a struct pattern means "ignore all remaining fields." Here, only name is extracted; all other fields (level, health, mana, etc.) are silently ignored. This is essential when a struct has many fields but you only need a few of them.'
      },
      {
        q: 'Given enum Msg { Login(String), Logout }, which pattern correctly extracts the username from a Login variant?',
        options: [
          'Msg::Login { user }',
          'Msg::Login(user)',
          'Msg::Login => user',
          'let user = Msg::Login;'
        ],
        answer: 1,
        explanation: 'Msg::Login carries a single unnamed value (a String). This is a tuple-style variant, so you destructure it with parentheses: Msg::Login(user) binds that String to the variable user. Curly-brace syntax (Msg::Login { user }) is for named-field variants like Login { username: String }.'
      },
      {
        q: 'From Chapter 15: why does adding a new variant to an enum cause existing match expressions elsewhere in the code to fail to compile?',
        options: [
          'Because enum variants must all be the same memory size',
          'Because match is exhaustive: the new variant has no arm to handle it, so the match is no longer covering all cases',
          'Because the compiler recompiles all files in the project whenever any enum changes',
          'Because the new variant name might shadow a match guard variable'
        ],
        answer: 1,
        explanation: 'Rust\'s exhaustiveness requirement means every possible value must be handled. When you add a new variant, existing match expressions that do not have a _ catch-all immediately fail to compile because they are missing an arm for the new case. This is intentional: it forces every call site to consciously handle the new state.'
      }
    ]
  },


  'ch17': {
    title: 'Chapter 17 Quiz: Designing Custom Data Types',
    questions: [
      {
        q: 'When should you choose an enum over a struct to model data?',
        options: [
          'When your data has more than three fields',
          'When your data needs to attach methods',
          'When your data can be in one of several mutually exclusive states, with each state potentially carrying different data',
          'When all fields of the type are the same primitive type'
        ],
        answer: 2,
        explanation: 'An enum models a sum type: the value is exactly one of several variants at any given time. A struct models a product type: all fields coexist simultaneously. Use an enum when the "shape" of the data changes depending on the current state (e.g., a connection is either Connecting, Connected, or Failed, each needing different fields).'
      },
      {
        q: 'The principle "make illegal states unrepresentable" means:',
        options: [
          'Mark all struct fields as private so outsiders cannot set invalid values',
          'Design your types so that contradictory or invalid combinations of data literally cannot be constructed at the type level',
          'Add runtime assertions (assert!) to every function to validate inputs',
          'Use only primitive types so the compiler can verify correctness more easily'
        ],
        answer: 1,
        explanation: 'If your type can hold contradictory data (e.g., is_done: false AND completed_at: Some(...)), bugs can be silently introduced. By encoding state into enum variants where each variant carries only the data that makes sense for that state, you make invalid combinations impossible to construct — the type system enforces the rules, not runtime checks.'
      },
      {
        q: 'An enum variant can hold which of the following kinds of data?',
        options: [
          'Only primitive types such as integers, booleans, and floats',
          'Only other enum types',
          'Named struct-like fields, unnamed tuple-like fields, or no data at all — all in the same enum',
          'Only types that implement the Copy trait'
        ],
        answer: 2,
        explanation: 'Rust enums are highly flexible. A single enum can have variants with no data (Quit), tuple-style variants (Write(String)), and struct-style variants (Move { x: i32, y: i32 }), all in the same definition. Each variant is completely independent in what data it carries.'
      },
      {
        q: 'From Chapter 16: given enum Msg { Login(String), Logout }, which code correctly extracts the username when the message is a Login variant?',
        options: [
          'let username = Msg::Login;',
          'if let Msg::Login(username) = msg { println!("{}", username); }',
          'match msg { Msg::Login => println!("{}", msg.0), _ => {} }',
          'let Msg { username } = msg;'
        ],
        answer: 1,
        explanation: 'if let Msg::Login(username) = msg destructures the Login variant and binds the contained String to username, then executes the block only when the pattern matches. This is the idiomatic way to extract data from a single enum variant when you do not need to handle all variants.'
      },
      {
        q: 'From Chapter 12: you define struct User { name: String, active: bool }. Which statement about mutability is correct?',
        options: [
          'You can mark individual fields as mutable with let mut inside the struct definition',
          'Rust provides automatic zero-initialization for any field you do not set',
          'To modify any field on a User instance, you must declare the entire instance with mut: let mut user = User { ... }',
          'Fields of type bool are always immutable; only String fields can be changed'
        ],
        answer: 2,
        explanation: 'In Rust, mutability is applied to the entire binding, not to individual fields. If you declare let user = User { ... } (without mut), no field can be changed. If you declare let mut user = User { ... }, all fields become changeable. There is no per-field mutability in the struct definition itself.'
      }
    ]
  },

});
