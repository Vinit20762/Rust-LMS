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

});
