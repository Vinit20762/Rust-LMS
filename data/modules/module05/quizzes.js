/* ================================================================
   Module 5: Lifetimes & Memory Safety
   Quizzes: ch27, ch28
   ================================================================ */
Object.assign(QUIZZES, {
  'ch27': {
    title: 'Chapter 27 Quiz: Lifetime Annotations',
    questions: [
      {
        q: 'What does a lifetime in Rust represent?',
        options: [
          'The amount of memory allocated to a variable',
          'The scope during which a reference is guaranteed to be valid',
          'The number of times a value can be borrowed',
          'The time it takes for a value to be dropped'
        ],
        answer: 1,
        explanation: 'A lifetime is the span of code during which a reference is valid. It is not about memory size, borrow counts, or execution time.'
      },
      {
        q: 'Why does the compiler reject the `longest` function without lifetime annotations when it returns a reference?',
        options: [
          'Because string slices cannot be returned from functions',
          'Because the compiler cannot determine at compile time which input reference the return value refers to',
          'Because two parameters of the same type are not allowed',
          'Because &str is not a valid return type in Rust'
        ],
        answer: 1,
        explanation: 'When a function can return one of several input references, the compiler cannot infer which one\'s lifetime governs the return value. Explicit annotations are required to clarify this relationship.'
      },
      {
        q: 'What does the annotation `\'a` in `fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str` tell the compiler?',
        options: [
          'That the function allocates memory for duration \'a',
          'That all three references must outlive the static lifetime',
          'That the returned reference will be valid for at least as long as both x and y are valid',
          'That x and y must have identical lengths'
        ],
        answer: 2,
        explanation: '\'a expresses a constraint: the returned reference is valid for the overlap of the lifetimes of x and y. The compiler uses the shorter of the two concrete lifetimes.'
      },
      {
        q: 'When you pass two references with different concrete lifetimes to `longest<\'a>`, what lifetime does the compiler assign to `\'a`?',
        options: [
          'The longer of the two lifetimes',
          'The lifetime of the first argument',
          'The lifetime of the second argument',
          'The shorter of the two lifetimes'
        ],
        answer: 3,
        explanation: 'The compiler sets \'a to the intersection (shortest overlap) of the two concrete lifetimes. This is the most conservative safe choice, ensuring the returned reference cannot outlive either input.'
      },
      {
        q: 'Which statement about lifetime annotations is true?',
        options: [
          'Lifetime annotations extend how long a value lives in memory',
          'Lifetime annotations only affect how the borrow checker interprets relationships between references',
          'Adding \'static to a reference causes the value to live forever',
          'Lifetime annotations are only required for mutable references'
        ],
        answer: 1,
        explanation: 'Lifetime annotations are descriptive, not prescriptive. They tell the borrow checker how lifetimes relate to each other. They do not extend or shorten the actual life of any value in memory.'
      }
    ]
  },

  'ch28': {
    title: 'Chapter 28 Quiz: Lifetime Elision Rules',
    questions: [
      {
        q: 'What is lifetime elision in Rust?',
        options: [
          'A feature that removes lifetimes from compiled code',
          'A set of compiler rules that automatically infer lifetimes in common patterns, letting you omit explicit annotations',
          'A runtime process that extends reference validity',
          'A linter warning triggered when lifetimes are written unnecessarily'
        ],
        answer: 1,
        explanation: 'Lifetime elision is a set of deterministic rules the compiler applies to infer lifetimes when the pattern is unambiguous. It does not remove lifetimes conceptually; it just lets you omit writing them.'
      },
      {
        q: 'Which elision rule allows `fn first_word(s: &str) -> &str` to compile without explicit annotations?',
        options: [
          'Rule 1 only: each input reference gets its own lifetime',
          'Rules 1 and 2 together: one input gets its own lifetime, and the output inherits it',
          'Rule 3: the output inherits the lifetime of &self',
          'Rule 2 only: the output borrows from the single input'
        ],
        answer: 1,
        explanation: 'Rule 1 assigns \'a to the single input &str. Rule 2 then sees exactly one input lifetime and assigns it to the output &str. Both rules together enable elision here.'
      },
      {
        q: 'Why does `fn ambiguous(x: &str, y: &str) -> &str` fail to compile without annotations?',
        options: [
          'Two &str parameters are not allowed in one function',
          'Rule 1 gives x and y separate lifetimes, and Rule 2 does not apply because there are multiple input lifetimes, so the output lifetime is ambiguous',
          'The return type must be String, not &str, for multi-argument functions',
          'Rule 3 would need &self to resolve the output lifetime'
        ],
        answer: 1,
        explanation: 'Rule 1 assigns \'a to x and \'b to y. Rule 2 requires exactly one input lifetime to assign to the output, but there are two. Rule 3 requires &self. None of the rules resolve the output, so explicit annotation is required.'
      },
      {
        q: 'Elision Rule 3 states that if one of the inputs is `&self` or `&mut self`, the output lifetime is assigned the lifetime of `self`. When does this rule apply?',
        options: [
          'In any function that has a &self parameter anywhere',
          'Only in method definitions on a struct or enum (impl blocks)',
          'Only when the method returns a value of type &Self',
          'In free functions that take a reference named self'
        ],
        answer: 1,
        explanation: 'Rule 3 applies specifically to methods in impl blocks where &self or &mut self is one of the parameters. It does not apply to free functions, and it applies regardless of what type the method returns.'
      },
      {
        q: 'When must you write explicit lifetime annotations instead of relying on elision?',
        options: [
          'Always — elision is only syntactic sugar and must be expanded for production code',
          'When the function has exactly one input reference',
          'When the compiler cannot unambiguously apply the three elision rules to determine all output lifetimes',
          'Only when using mutable references'
        ],
        answer: 2,
        explanation: 'Elision only works when the three rules produce a complete, unambiguous assignment of lifetimes to all output references. When ambiguity remains (such as two input references with no &self), explicit annotations are required.'
      }
    ]
  }
});
