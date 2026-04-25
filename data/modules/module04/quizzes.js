/* ================================================================
   Module 4 Quizzes — 5 questions per chapter
   (This file covers ch18, ch19, ch20 — more chapters added later)
   ================================================================ */
Object.assign(QUIZZES, {

  'ch18': {
    title: 'Chapter 18 Quiz: Stack vs Heap',
    questions: [
      {
        q: 'What is the fundamental rule that determines whether a value lives on the stack or the heap in Rust?',
        options: [
          'Values smaller than 64 bytes go on the stack; larger values go on the heap',
          'Primitive types always go on the stack; everything else goes on the heap',
          'Values whose size is known and fixed at compile time live on the stack; values that can change size live on the heap',
          'The programmer chooses manually using stack::put() or heap::put()'
        ],
        answer: 2,
        explanation: 'The compiler must know the exact byte size of stack data at compile time so it can calculate offsets. Types with a fixed, known size (i32, f64, bool, char) are stack-allocated. Types that can grow or shrink (String, Vec<T>) must live on the heap because their size is not known until the program runs.'
      },
      {
        q: 'A String variable in Rust stores three things on the stack: a pointer, a length, and a capacity. Where does the actual string content live?',
        options: [
          'Embedded directly in the stack alongside the pointer, length, and capacity',
          'In the program binary (static memory), alongside string literals',
          'On the heap, pointed to by the pointer stored on the stack',
          'In a special string segment of memory separate from both stack and heap'
        ],
        answer: 2,
        explanation: 'The String struct on the stack is a fixed-size "header" (24 bytes on 64-bit systems: 8 bytes pointer + 8 bytes length + 8 bytes capacity). The actual character bytes live on the heap at the address the pointer holds. This is why String can grow: the heap portion can be reallocated larger.'
      },
      {
        q: 'Why is stack allocation faster than heap allocation?',
        options: [
          'The stack uses faster RAM chips than the heap',
          'Stack allocation is just moving a single pointer, requiring no bookkeeping. Heap allocation requires finding free space, updating allocator metadata, and tracking the allocation',
          'The stack is stored in CPU registers while the heap is in RAM',
          'Stack allocations are done at compile time, so there is no runtime cost at all'
        ],
        answer: 1,
        explanation: 'Pushing onto the stack is as cheap as incrementing or decrementing the stack pointer — a single machine instruction. Heap allocation requires the allocator to search free lists, find a block large enough, mark it as used, and return a pointer. All of this bookkeeping takes significantly more time.'
      },
      {
        q: 'When a function returns in Rust, what happens to the local variables it declared on its stack frame?',
        options: [
          'They are moved to the heap so they can be accessed by the caller',
          'They remain on the stack until the garbage collector collects them',
          'Their stack space is reclaimed immediately; any heap data they owned is also freed (unless the values were returned or moved out)',
          'The programmer must manually call drop() on each variable before returning'
        ],
        answer: 2,
        explanation: 'When a function returns, its entire stack frame is popped. For variables holding heap data that were not returned or moved out, Rust\'s drop mechanism also frees their heap allocations at this point. No manual cleanup is required, and there is no garbage collector delay — cleanup is immediate and deterministic.'
      },
      {
        q: 'From Chapter 17: a struct User { username: String, score: u32 } is created. Which statement is correct about its memory layout?',
        options: [
          'The entire User struct, including the string content, lives on the stack',
          'The User struct lives on the heap; primitive fields like score live on the stack',
          'The User struct variable lives on the stack, but the username field\'s string content lives on the heap',
          'score is on the heap because it is inside a struct; username is on the stack because String implements Copy'
        ],
        answer: 2,
        explanation: 'The User struct itself (the stack variable) holds the score directly and holds a String "header" (pointer + length + capacity). The stack has all of this. But the actual characters of username are stored on the heap, pointed to by the String\'s pointer. Struct variables are stack-allocated, but any heap-owning fields still allocate on the heap.'
      }
    ]
  },


  'ch19': {
    title: 'Chapter 19 Quiz: Move Semantics',
    questions: [
      {
        q: 'What happens to variable s1 after this code runs?\n\nlet s1 = String::from("hello");\nlet s2 = s1;',
        options: [
          's1 and s2 both contain independent copies of "hello" on the heap',
          's1 still owns the data; s2 is an alias that points to the same memory',
          's1 is invalidated (moved); s2 is the sole owner of the heap data',
          's1 is automatically cloned so both remain valid'
        ],
        answer: 2,
        explanation: 'Assignment of a heap-owning type (like String) performs a move, not a copy. The three stack values (pointer, length, capacity) are copied into s2, but s1 is immediately invalidated by the compiler. There is now exactly one owner of the heap data: s2. Trying to use s1 afterward is a compile error.'
      },
      {
        q: 'Why does Rust use move semantics for heap types instead of automatically copying the heap data on every assignment?',
        options: [
          'Because heap copying is impossible in Rust without unsafe code',
          'Because moves are always semantically correct; copies are not always what the programmer intends',
          'Because heap allocation is expensive and Rust never silently performs expensive operations; copies must be explicit via .clone()',
          'Because the Rust compiler cannot determine the size of heap data at compile time'
        ],
        answer: 2,
        explanation: 'Rust\'s design principle is that expensive operations must be explicit. Copying heap data means allocating new memory and copying every byte, which can be very slow for large data. By making copies opt-in (via .clone()), Rust ensures that every assignment is cheap by default, and the programmer consciously decides when to pay the cost of a deep copy.'
      },
      {
        q: 'Which of these types uses Copy semantics (not Move) when assigned to another variable?',
        options: [
          'String',
          'Vec<i32>',
          'i32',
          'struct Point { x: f64, y: f64 } (with no #[derive(Copy)])'
        ],
        answer: 2,
        explanation: 'i32 is a stack-only type with a fixed size (4 bytes). Copying it is as cheap as copying 4 bytes. All primitive numeric types, bool, and char implement the Copy trait. String and Vec own heap data and do not implement Copy. A custom struct only implements Copy if explicitly derived and if all its fields implement Copy.'
      },
      {
        q: 'You call a function that takes a String parameter by value. After the call returns, can you still use the String variable you passed?',
        options: [
          'Yes, Rust automatically returns ownership to the caller after the function runs',
          'Yes, because String implements Copy, so the function gets a copy',
          'No: passing a String by value moves ownership into the function. The variable in the caller is invalidated',
          'Yes, if the function did not modify the String'
        ],
        answer: 2,
        explanation: 'Passing a value to a function is identical to assigning it to a new variable — ownership is moved into the function parameter. The caller\'s variable is invalidated immediately. When the function returns, the parameter is dropped (unless returned). To keep using the value after the call, either pass a reference (&String) or return it back from the function.'
      },
      {
        q: 'From Chapter 18: a Vec<i32> variable stores its elements on the heap. After this code runs — let v1 = vec![1, 2, 3]; let v2 = v1; — how many heap allocations exist for these elements?',
        options: [
          'Two: v1 and v2 each hold an independent copy of [1, 2, 3] on the heap',
          'One: the move transferred ownership of the single heap allocation from v1 to v2',
          'Zero: the elements were moved to the stack during the assignment',
          'Three: one per element, each element moves independently'
        ],
        answer: 1,
        explanation: 'A move does not copy heap data. It transfers ownership of the existing single heap allocation from v1 to v2. After the move, v2 holds the pointer to that allocation, and v1 is invalidated. There is still exactly one heap allocation containing [1, 2, 3]. No elements were copied or duplicated.'
      }
    ]
  },


  'ch20': {
    title: 'Chapter 20 Quiz: Ownership Rules',
    questions: [
      {
        q: 'Which of the three ownership rules directly prevents the double-free memory bug?',
        options: [
          'Rule 3: when the owner goes out of scope, the value is dropped',
          'Rules 1 and 2 together: each value has exactly one owner, and only one owner at a time',
          'Rule 1 alone: each value has exactly one owner',
          'None of the ownership rules address double-free; that is handled by the borrow checker separately'
        ],
        answer: 1,
        explanation: 'A double-free happens when two variables both try to free the same heap memory. Rules 1 and 2 make this impossible: only one variable can be the owner at any time. When that single owner is dropped (Rule 3), the memory is freed exactly once. There is never a second owner to trigger a second free.'
      },
      {
        q: 'When exactly is a Rust value dropped?',
        options: [
          'When the garbage collector decides the value is no longer reachable',
          'When the programmer calls drop(value) explicitly',
          'When the variable that owns the value goes out of its scope (reaches the closing })',
          'When the value has not been accessed for a certain number of milliseconds'
        ],
        answer: 2,
        explanation: 'Rust drops values deterministically at scope exit: the closing } of the block that contains the owning variable. This is compile-time determined; there is no runtime garbage collector. The compiler inserts the cleanup call exactly at that point. You can call drop(value) early if needed, but the automatic drop at scope exit is guaranteed.'
      },
      {
        q: 'What is RAII (Resource Acquisition Is Initialization) and how does Rust use it?',
        options: [
          'RAII is a Rust-specific term meaning "memory is initialized to zero before use"',
          'RAII is a pattern where resource cleanup is tied to the lifetime of an object: when the object is dropped, its associated resources (memory, file handles, sockets) are automatically released',
          'RAII means "resource allocation is invalid initially" — resources start in an error state and must be initialized',
          'RAII is a compiler optimization that reuses stack frames to avoid repeated allocation'
        ],
        answer: 1,
        explanation: 'RAII ties resource ownership to variable lifetime. In Rust, this is enforced by the Drop trait: when a value\'s owner goes out of scope, Rust calls drop() which frees memory, closes files, disconnects sockets, etc. Programmers never manually free resources — the scope boundary is the cleanup trigger. This eliminates resource leaks.'
      },
      {
        q: 'In what order are local variables dropped when a function returns?',
        options: [
          'In the order they were declared (first declared, first dropped)',
          'In reverse order of declaration (last declared, first dropped)',
          'In a random order determined by the compiler optimizer',
          'All at the same time, atomically'
        ],
        answer: 1,
        explanation: 'Variables are dropped in reverse order of declaration. This is intentional: a variable declared later might hold a reference or dependency on a variable declared earlier. Dropping the later one first ensures no use-after-free within the same scope. For example, if y = &x, y must be dropped before x.'
      },
      {
        q: 'From Chapter 19: which code correctly allows you to use a String after passing it to a function that needs to print it?',
        options: [
          'fn print_it(s: String) { println!("{}", s); }\nfn main() { let s = String::from("hi"); print_it(s); println!("{}", s); }',
          'fn print_it(s: &String) { println!("{}", s); }\nfn main() { let s = String::from("hi"); print_it(&s); println!("{}", s); }',
          'fn print_it(s: String) { println!("{}", s); }\nfn main() { let s = String::from("hi"); print_it(s.copy()); println!("{}", s); }',
          'fn print_it(s: String) -> String { println!("{}", s); s }\nfn main() { let s = String::from("hi"); print_it(s); println!("{}", s); }'
        ],
        answer: 1,
        explanation: 'Option B passes a reference (&s) to the function, which borrows the String without moving it. The function parameter is &String (a borrow), so no ownership transfer occurs. After print_it returns, the caller still owns s and can use it. Option A moves s into the function and the caller cannot use it after. Option D is also valid but requires the function to return ownership back.'
      }
    ]
  },

  'ch21': {
    title: 'Chapter 21 Quiz: References',
    questions: [
      {
        q: 'What does the & operator do when placed in front of a variable in Rust?',
        options: [
          'It makes a deep copy of the value, creating an independent duplicate on the heap',
          'It transfers ownership of the value to the new variable',
          'It creates a reference to the value, allowing access without taking ownership',
          'It marks the value as immutable for the rest of the current scope'
        ],
        answer: 2,
        explanation: 'The & operator creates a reference, which is a pointer to the value. The original owner is unchanged and still valid. The reference allows read access to the data without moving or copying it. This act of creating a reference is called borrowing.'
      },
      {
        q: 'Given: let s1 = String::from("hello"); let r = &s1; — which statement is true?',
        options: [
          's1 is invalidated because r now holds a pointer to its heap data',
          'r contains an independent copy of "hello" stored in a new heap allocation',
          's1 remains the owner; r is a reference that borrows the data without owning it',
          'The compiler rejects this because String values cannot be referenced'
        ],
        answer: 2,
        explanation: '&s1 creates a reference (borrow) to s1. s1 remains the owner and is still fully valid. r points to s1\'s data but does not own it. Both s1 and r can read "hello". No ownership transfer occurs and no copy is made.'
      },
      {
        q: 'How many immutable references (&T) to the same value are allowed to exist simultaneously?',
        options: [
          'Exactly one — having two references could create a conflict',
          'Exactly two — one primary and one secondary reference',
          'Any number — unlimited immutable references may coexist safely',
          'Zero — values must always be accessed directly, never through references'
        ],
        answer: 2,
        explanation: 'Any number of immutable references to the same value may coexist. Since none of them can modify the data, there is no conflict between them. This is the "any number of immutable references" part of Reference Rule 1.'
      },
      {
        q: 'What does the dereference operator * do when applied to a reference r?',
        options: [
          'It frees the memory that r points to',
          'It converts an immutable reference into a mutable one',
          'It follows the reference to give access to the value stored at that address',
          'It creates an owned deep copy of the value that r points to'
        ],
        answer: 2,
        explanation: 'The * operator follows the reference to the data it points to. *r gives you the value at the address r holds. It does not free memory, change mutability, or copy data. In most everyday contexts (println!, comparisons, method calls) Rust applies auto-deref, so you rarely need to write * explicitly for ordinary references.'
      },
      {
        q: 'From Chapter 20: after calling process(my_string) where the signature is fn process(s: String), what is the state of my_string in the caller?',
        options: [
          'my_string is still valid because Rust automatically copies String values when passing to functions',
          'my_string is still valid because functions always return their parameters back to the caller',
          'my_string has been moved into the function and is no longer usable in the caller',
          'my_string is temporarily borrowed by the function and restored when the function returns'
        ],
        answer: 2,
        explanation: 'String does not implement Copy. Passing my_string to a function that takes String by value moves ownership into the function. After the call, my_string is invalidated in the caller. To avoid this, pass a reference (&String) so ownership is borrowed rather than moved.'
      }
    ]
  },

  'ch22': {
    title: 'Chapter 22 Quiz: Mutable vs Immutable Borrow',
    questions: [
      {
        q: 'What two things are required before you can create a mutable reference (&mut T) to a value?',
        options: [
          'The value must be on the heap, and the reference must be declared with let mut',
          'The binding that owns the value must be declared with mut, and you use &mut to create the reference',
          'The value must implement the Copy trait, and the reference must be in a separate block',
          'The value must be a primitive type, and the function must return the reference'
        ],
        answer: 1,
        explanation: 'You need: (1) the owner binding declared as let mut so the data is mutable at all, and (2) the &mut operator to create a mutable reference to it. Both are required. A non-mut binding cannot have a mutable reference even if you use &mut.'
      },
      {
        q: 'How many mutable references to the same value can be active simultaneously?',
        options: [
          'Unlimited, as long as each one is in a different thread',
          'Up to two: one primary and one secondary',
          'Exactly one — only one mutable reference may exist at a given time',
          'Zero — you should always use owned values instead of mutable references'
        ],
        answer: 2,
        explanation: 'Only one mutable reference to a given value may be active at any point in time. This is the core of Reference Rule 1. It prevents data races by guaranteeing that a writer has exclusive access: no other readers or writers can exist simultaneously.'
      },
      {
        q: 'You have two immutable references r1 and r2 to a String s. After the last use of r1 and r2 (thanks to NLL), can you create a mutable reference r3 to s?',
        options: [
          'No — immutable references permanently block mutable references for the rest of the scope',
          'No — you must clone s first to get a mutable version',
          'Yes — once r1 and r2 are no longer used, their borrows end and a mutable reference is allowed',
          'Yes — mutable and immutable references to the same value can always coexist'
        ],
        answer: 2,
        explanation: 'Non-Lexical Lifetimes (NLL) ends a borrow at the last point the reference is used, not at the closing brace. Once r1 and r2 are last used (e.g., in a println!), their borrows end. After that point, a mutable reference r3 is allowed because no immutable references are active.'
      },
      {
        q: 'Why does Rust forbid having both a mutable reference and an immutable reference to the same value simultaneously?',
        options: [
          'Because Rust\'s compiler is not able to track two references at once due to performance constraints',
          'Because a writer modifying data while a reader reads it could cause the reader to see inconsistent or partially-modified data, which is a data race',
          'Because the Rust specification requires all references to have the same mutability',
          'Because mutable references use more memory than immutable references'
        ],
        answer: 1,
        explanation: 'If a mutable reference and an immutable reference coexisted, the writer could modify data while the reader was reading it, resulting in inconsistent state. In a concurrent context, this is a classic data race. Rust forbids this combination at compile time, eliminating the possibility entirely.'
      },
      {
        q: 'From Chapter 21: a function takes &String as its parameter. Can the function modify the String?',
        options: [
          'Yes — any function with access to the data can modify it',
          'Yes — but only if the original binding was declared as mut',
          'No — &String is an immutable reference; the function can only read the data',
          'No — functions can never modify data received through parameters'
        ],
        answer: 2,
        explanation: '&String is an immutable reference. A function receiving &String can read the data but cannot call methods that require mutable access (like push_str). To allow modification, the parameter must be &mut String and the call site must pass &mut s.'
      }
    ]
  },

  'ch23': {
    title: 'Chapter 23 Quiz: Dangling References',
    questions: [
      {
        q: 'What is a dangling reference?',
        options: [
          'A reference that has been explicitly freed using the drop() function',
          'A reference that points to memory that has already been freed or is otherwise invalid',
          'A reference to a value on the heap that has no owner',
          'A mutable reference that was never used after being created'
        ],
        answer: 1,
        explanation: 'A dangling reference is a pointer or reference that points to a memory location that was valid when the reference was created but has since been freed. Following a dangling reference causes undefined behavior. Rust prevents these at compile time by tracking the lifetimes of all values.'
      },
      {
        q: 'Why does Rust reject a function with signature fn dangle() -> &String that returns a reference to a locally created String?',
        options: [
          'Because String values cannot be referenced, only copied',
          'Because the local String is dropped when the function returns, so the reference would point to freed memory',
          'Because return type &String requires a lifetime annotation in all cases',
          'Because mutable references cannot be returned from functions'
        ],
        answer: 1,
        explanation: 'When the function returns, its local variables (including the String) are dropped. A reference to that String would then point to freed heap memory. Rust\'s borrow checker tracks the lifetime of the local String and sees that it does not live long enough to be returned as a reference.'
      },
      {
        q: 'What is the correct fix when you want a function to return string data but cannot return a reference to a local?',
        options: [
          'Use &str as the return type instead of &String',
          'Wrap the return value in Box<T>',
          'Return an owned String — ownership moves to the caller and the data lives on safely',
          'Use unsafe code to extend the lifetime of the local variable'
        ],
        answer: 2,
        explanation: 'The correct fix is to return an owned String (not a reference). When ownership moves out of a function via a return value, the data continues to live in the caller\'s scope. There is no dangling because ownership — and therefore the lifetime of the data — transfers to the caller.'
      },
      {
        q: 'Which of Rust\'s two reference rules does a dangling reference violate?',
        options: [
          'Rule 1: at any given time, only one mutable reference may exist',
          'Rule 2: references must always be valid (must always point to live data)',
          'Both rules simultaneously',
          'Neither rule — dangling references are allowed with the unsafe keyword'
        ],
        answer: 1,
        explanation: 'Rule 2 states that references must always be valid: they must always point to live, valid data. A dangling reference, by definition, points to freed memory — invalid data. This is a Rule 2 violation. (With unsafe, Rust does allow raw pointers that can dangle, but not safe references.)'
      },
      {
        q: 'From Chapter 22: consider let r; { let x = 5; r = &x; } println!("{}", r); — why does the compiler reject this?',
        options: [
          'Because x is declared inside a block and block-scoped variables cannot be referenced',
          'Because x is on the stack and stack values cannot be referenced',
          'Because r holds a reference to x, but x is dropped at the end of the inner block, so r would dangle after that point',
          'Because r is declared without a type annotation'
        ],
        answer: 2,
        explanation: 'x is dropped when the inner block ends. At that point, r still exists in the outer scope and still holds the address of x. If used after the block, r would be a dangling reference to freed stack memory. The borrow checker sees that x\'s lifetime is shorter than r\'s lifetime and rejects the code.'
      }
    ]
  },

  'ch24': {
    title: 'Chapter 24 Quiz: Slices',
    questions: [
      {
        q: 'What does a string slice (&str) store internally?',
        options: [
          'A copy of the string characters on the heap',
          'A pointer to the first character and the length of the slice',
          'The index of the first character and the index of the last character',
          'A reference to the owning String\'s metadata (pointer, length, capacity)'
        ],
        answer: 1,
        explanation: 'A &str is a "fat pointer": two words of data. The first is a pointer to the starting byte in the original string\'s memory. The second is the length of the slice in bytes. No heap allocation is made. The original owner still owns the underlying memory.'
      },
      {
        q: 'Given let s = String::from("hello world"); — what does &s[6..11] produce?',
        options: [
          'A new String containing "world"',
          'A &str slice pointing to the "world" portion of s\'s memory',
          'An error: slice indices are only valid for string literals',
          'A copy of bytes 6 through 11 stored in a new heap allocation'
        ],
        answer: 1,
        explanation: '&s[6..11] produces a &str — an immutable reference to bytes 6, 7, 8, 9, 10 of the String s. It does not copy or allocate. The slice is a view into the existing heap memory owned by s. The original String s is still valid and owns the data.'
      },
      {
        q: 'Why is &str generally preferred over &String as a function parameter type for read-only string access?',
        options: [
          '&str is faster at runtime because it skips bounds checking',
          '&str can only be used with string literals, which are faster than String',
          '&str works with string literals, slices of Strings, and whole Strings (via coercion), making the function more flexible',
          '&String cannot be used in function parameters due to ownership rules'
        ],
        answer: 2,
        explanation: 'A function taking &str accepts: string literals directly, any &s where s: String (auto-coercion from &String to &str), and any &s[..] slice. A function taking &String only accepts &String, not string literals or slices. &str is strictly more general for read-only access.'
      },
      {
        q: 'What is the type of a slice of an i32 array?',
        options: [
          '&Array',
          '&[i32]',
          'Slice<i32>',
          '&i32[]'
        ],
        answer: 1,
        explanation: 'A slice of an array of i32 has type &[i32]. For any element type T, an array slice has type &[T]. Like string slices, array slices are fat pointers (pointer + length) and do not own the data.'
      },
      {
        q: 'From Chapter 21: a slice is a kind of reference. What does this mean for ownership?',
        options: [
          'The slice takes ownership of the portion of the collection it references',
          'The slice does not own the data; it borrows a view into data owned by someone else',
          'The slice creates a new owned copy of the data it refers to',
          'The original collection\'s ownership is split between the slice and the original binding'
        ],
        answer: 1,
        explanation: 'A slice is a reference — it borrows data. It does not own the data it views. The original collection retains ownership. This means the borrow rules apply: while a slice exists, the original collection is under an immutable borrow and cannot be mutated (or moved, or dropped while the slice is in use).'
      }
    ]
  },

  'ch25': {
    title: 'Chapter 25 Quiz: Borrow Checker Errors',
    questions: [
      {
        q: 'What is the most reliable first step when you encounter a borrow checker error?',
        options: [
          'Add .clone() to every variable mentioned in the error',
          'Wrap the problematic code in an unsafe block',
          'Read the full error message, including the note and help sections, to find where the conflicting borrow started',
          'Change all &T references to &mut T to give them more permissions'
        ],
        answer: 2,
        explanation: 'Borrow checker errors always include a note or label showing where the conflicting borrow began — often several lines before the red-squiggle line. The fix usually belongs at that earlier location (shorten the borrow, restructure, or switch to a reference instead of a move), not at the error line itself.'
      },
      {
        q: 'You write: let v = vec![1,2,3]; let first = &v[0]; v.push(10); println!("{}", first); — why does the compiler reject this?',
        options: [
          'Because v is immutable and push() requires a mutable Vec',
          'Because first is an immutable borrow of v, and push() requires a mutable borrow of v; these two borrows cannot coexist',
          'Because Vec slices cannot be stored in variables',
          'Because println! cannot print i32 values from a slice reference'
        ],
        answer: 1,
        explanation: 'first = &v[0] takes an immutable borrow of v. v.push(10) requires a mutable borrow of v to modify it. Rust cannot allow both at the same time (Rule 1 violation). Additionally, push may reallocate the buffer, which would leave first pointing to freed memory — exactly the kind of bug the borrow checker prevents.'
      },
      {
        q: 'After calling consume(s) where consume has signature fn consume(s: String), what is the state of s?',
        options: [
          's is unchanged because functions work on copies',
          's is in a "borrowed" state and will be restored when consume returns',
          's has been moved into consume; it is no longer valid in the calling scope',
          's still exists but is now empty (like calling s.clear())'
        ],
        answer: 2,
        explanation: 'Passing s to a function taking String by value moves ownership into the function. After the call, s is invalidated in the caller (error E0382 if used). The data is now owned by consume\'s parameter and will be dropped when consume returns, unless the function returns it or moves it elsewhere.'
      },
      {
        q: 'Which strategy is BEST when you need to pass a String to two different functions that each need to read it?',
        options: [
          'Pass s to the first function, which must return it, then pass it to the second',
          'Pass &s (an immutable reference) to both functions — borrowing allows multiple readers',
          'Call s.clone() before each function call to give each function its own copy',
          'Use unsafe code to bypass ownership rules'
        ],
        answer: 1,
        explanation: 'When functions only need to read data, pass &s (an immutable reference). Multiple immutable references can coexist (Rule 1: any number of immutable references). This is the idiomatic, zero-cost solution. Cloning works but wastes memory for what should be a simple read.'
      },
      {
        q: 'From Chapter 22: at what point does NLL (Non-Lexical Lifetimes) consider a borrow to end?',
        options: [
          'At the closing curly brace of the innermost block containing the reference',
          'When the reference variable is reassigned to a new value',
          'At the last point in the code where the reference is actually used',
          'When the function that created the reference returns'
        ],
        answer: 2,
        explanation: 'NLL ends a borrow at the last point the reference is used, not at the closing brace of the surrounding block. This means borrows are shorter than they used to be in older Rust, allowing patterns like using immutable references and then creating a mutable reference later in the same scope, as long as the immutable references are not used after the mutable one is created.'
      }
    ]
  },

  'ch26': {
    title: 'Chapter 26 Quiz: Interior Mutability (Cell, RefCell)',
    questions: [
      {
        q: 'What is interior mutability in Rust?',
        options: [
          'A technique to make immutable structs faster by avoiding copies',
          'A pattern that allows mutating data through a shared (&) reference, by moving borrow checking to runtime',
          'A compiler optimisation that removes unnecessary borrow checks',
          'A way to share mutable references across multiple threads safely'
        ],
        answer: 1,
        explanation: 'Interior mutability allows mutating data even when you only have an immutable reference (&T) to the outer container. Types like Cell<T> and RefCell<T> achieve this by wrapping unsafe code in a safe API. Cell<T> does so without runtime checks (for Copy types). RefCell<T> does so by checking borrow rules at runtime instead of compile time.'
      },
      {
        q: 'What is the key difference between Cell<T> and RefCell<T>?',
        options: [
          'Cell is for heap data; RefCell is for stack data',
          'Cell replaces the value entirely (no reference to interior); RefCell hands out runtime-checked references to the interior',
          'Cell is thread-safe; RefCell is not',
          'Cell panics on borrow violations; RefCell returns an error Result'
        ],
        answer: 1,
        explanation: 'Cell<T> never gives out a reference to its interior. You can only get() (for Copy types, copies the value) or set() (replaces the value). Because no reference exists, no borrow tracking is needed. RefCell<T> hands out Ref<T> (immutable) and RefMut<T> (mutable) reference guards, and tracks active borrows at runtime to enforce the borrow rules.'
      },
      {
        q: 'What happens if you call borrow_mut() on a RefCell<T> while a RefMut guard from a previous borrow_mut() call is still alive?',
        options: [
          'The second call silently succeeds, giving you two mutable views',
          'The second call returns None',
          'The program panics at runtime with a message about the RefCell being already borrowed',
          'The compiler detects this at compile time and rejects the code'
        ],
        answer: 2,
        explanation: 'RefCell enforces borrow rules at runtime. If you try to take a second mutable borrow while the first is still active, borrow_mut() panics immediately with a message like "already mutably borrowed". This is the same rule as compile-time borrow checking, but enforced at runtime. Use try_borrow_mut() to get a Result instead of a panic.'
      },
      {
        q: 'Why can RefCell<T> only be used in single-threaded code?',
        options: [
          'Because RefCell is too slow for multithreaded performance requirements',
          'Because RefCell\'s runtime borrow counter is not atomic; concurrent access from multiple threads could corrupt the counter itself',
          'Because the Rust compiler applies different rules to multithreaded code',
          'Because heap-allocated data cannot be shared between threads'
        ],
        answer: 1,
        explanation: 'RefCell\'s borrow counter (an integer it maintains internally) is not protected by atomic operations. If two threads incremented the counter simultaneously, the increment could be lost (a classic data race on the counter itself). For thread-safe interior mutability, use Mutex<T> or RwLock<T> from std::sync instead.'
      },
      {
        q: 'From Chapter 22: if you can use a plain &mut reference, should you use RefCell instead?',
        options: [
          'Yes — RefCell is always safer because it defers checking to runtime',
          'Yes — RefCell allows more flexible code patterns in all situations',
          'No — use &mut when the borrow checker can verify safety statically; RefCell adds runtime overhead and defers error detection',
          'No — RefCell and &mut are identical in capability and performance'
        ],
        answer: 2,
        explanation: 'A plain &mut reference is checked at compile time with zero runtime overhead. RefCell adds a small runtime cost (maintaining the borrow counter) and moves error detection to runtime (a panic instead of a compiler error). Only use RefCell when the compile-time borrow checker is too conservative for your specific design and you need interior mutability through a shared reference.'
      }
    ]
  },

});
