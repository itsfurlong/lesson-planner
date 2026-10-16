/* Phrase banks for the interview. Drafted in Lesson-Planner_QuestionMap_v1.md, section 4. */
window.LP_BANKS = {
  bloom: {
    Remember: ['define', 'list', 'identify', 'recall', 'name', 'state'],
    Understand: ['explain', 'summarize', 'paraphrase', 'describe', 'classify', 'compare'],
    Apply: ['use', 'demonstrate', 'solve', 'apply', 'construct', 'illustrate'],
    Analyze: ['analyze', 'differentiate', 'examine', 'distinguish', 'infer', 'organize'],
    Evaluate: ['judge', 'critique', 'justify', 'defend', 'assess', 'argue'],
    Create: ['write', 'compose', 'design', 'develop', 'produce', 'plan']
  },
  // One-line meanings for activity and material terms. Display only, shown in a "What do these mean?" box on the screens that use them.
  glossary: {
    'Exit slip': 'A short written answer students hand in on the way out.',
    'KWL chart': 'A chart of what students Know, Want to know, and Learned.',
    'Anticipation guide': 'True or false statements students react to before reading or learning.',
    'Think-pair-share': 'Students think alone, talk with a partner, then share with the class.',
    'Jigsaw': 'Each student becomes the expert on one part, then teaches their group.',
    'Fishbowl': 'A small group discusses in the middle while the rest watch and listen.',
    'Graphic organizer': 'A chart or diagram that helps students sort ideas on paper.',
    'Mentor text': 'A model piece of writing students study and borrow techniques from.',
    'Word wall': 'Key words posted where students can see and use them.',
    'Peer conferencing': 'Students give each other feedback on their work.',
    'Share-out': 'Volunteers tell the class what they wrote or talked about.'
  },
  // Plain one-line descriptions for the research cards, keyed by the exact name in citations.json. Display only.
  frameworkPlain: {
    'Zone of proximal development (Vygotsky)': 'Students learn best from tasks a bit too hard to do alone, with help from you or a partner.',
    'Gradual release of responsibility (Pearson & Gallagher)': 'You show it, then do it together, then students do it alone.',
    "Revised Bloom's taxonomy (Anderson & Krathwohl)": 'A way to describe how hard students think, from remembering to creating, and what kind of knowledge they use.',
    'Scaffolding (Wood, Bruner & Ross)': 'Temporary supports, like models or sentence starters, that you remove as students improve.',
    'Understanding by Design (Wiggins & McTighe)': 'Plan backward: decide what students should be able to do and how you will check, then plan the lesson.',
    'Universal Design for Learning (CAST)': 'Give students several ways to get interested, take in the content, and show what they learned.',
    'Formative assessment (Black & Wiliam)': 'Quick checks during the lesson that tell you how to adjust your teaching.',
    'Differentiated instruction (Tomlinson)': 'Change the content, the activity, or the final product to fit different students.',
    'Self-efficacy (Bandura)': 'Students try harder when they believe they can succeed, so tasks are doable and success is visible.',
    'Culturally relevant pedagogy (Ladson-Billings)': "Treat students' cultures, languages, and experiences as strengths to build on.",
    'Transactional theory of reading (Rosenblatt)': 'A reader makes meaning from the text together with their own experiences and responses.',
    'Schema and cognitive development (Piaget)': 'Students learn by connecting new ideas to what they already know.'
  },
  // Display text for the support evidence chips. The stored value stays the short label.
  evidenceLong: {
    'IEP': 'IEP (individualized education program)',
    '504 plan': '504 plan (a plan for classroom accommodations)',
    'ELL': 'ELL (English language learner)',
    'ADHD': 'ADHD (attention-deficit/hyperactivity disorder)'
  },
  knowledge: ['factual', 'conceptual', 'procedural', 'metacognitive'],
  // Plain meanings shown next to the level and knowledge picks on the objective screen. Display only: the stored values stay the words above.
  levelMeaning: {
    Remember: 'recall facts or terms',
    Understand: 'explain in their own words',
    Apply: 'use a skill in a new situation',
    Analyze: 'break something apart to see how it works',
    Evaluate: 'judge something and defend the judgment',
    Create: 'make something new'
  },
  knowledgeMeaning: {
    factual: { short: 'facts and vocabulary', example: 'the parts of a dialogue tag' },
    conceptual: { short: 'ideas and how things connect', example: 'how dialogue shows character' },
    procedural: { short: 'steps and how to do something', example: 'how to punctuate dialogue' },
    metacognitive: { short: 'thinking about their own thinking', example: 'noticing which revision habits work for you' }
  },
  notMeasurable: ['understand', 'know', 'learn', 'appreciate', 'be aware of', 'become familiar with'],
  priorStarters: [
    'Students have read {text} up to {point}.',
    'Students have practiced {skill} in {context}.',
    'Students have been introduced to {concept} but have not applied it.',
    'Students have not yet seen {topic}.'
  ],
  // Suggested prior knowledge per skill. {topic} becomes the central focus. See Lesson-Planner_RevisionMap_v1.md, section 2.
  priorSuggestions: {
      "Narrative writing": [
          "Students have written short narratives and know the basic parts of a story: setting, characters, conflict, and resolution.",
          "Students have practiced using dialogue and description in their own writing, but have not yet chosen techniques on purpose for {topic}.",
          "Students have read mentor narratives and can point to a technique the author used.",
          "Students have not yet written a full scene for {topic}."
      ],
      "Argument writing": [
          "Students can state a claim and give a reason for it, but have not yet answered a counterclaim.",
          "Students have practiced citing evidence from a text to support an opinion.",
          "Students have seen a model argument and know its parts: claim, evidence, and reasoning.",
          "Students have not yet written a full argument on {topic}."
      ],
      "Informational/Expository writing": [
          "Students have written informative paragraphs with a topic sentence and supporting facts.",
          "Students can pull facts from a text but have not yet organized them across several paragraphs on {topic}.",
          "Students have used headings or transitions in earlier writing, with support.",
          "Students are new to {topic}."
      ],
      "Characterization": [
          "Students can describe a character's traits using what the character says and does.",
          "Students have practiced citing a line from the text to support a claim about a character.",
          "Students have not yet explained how a character changes over a whole text."
      ],
      "Conflict": [
          "Students can name the main conflict in a story they have read.",
          "Students know the difference between internal and external conflict but have not yet analyzed how conflict drives a plot.",
          "Students have not yet traced conflict across a whole text for {topic}."
      ],
      "Theme": [
          "Students can tell the difference between a topic and a theme.",
          "Students have stated a theme for a short text with teacher support.",
          "Students have not yet traced how a theme develops over a whole text."
      ],
      "Evidence and citation": [
          "Students can quote a line from a text, but are still learning to explain how it supports a claim.",
          "Students have practiced introducing and citing a quotation, with a model.",
          "Students have not yet chosen the strongest evidence from several options for {topic}."
      ],
      "Vocabulary": [
          "Students have used context clues to work out an unknown word, with support.",
          "Students have seen the key words for {topic}, but have not yet used them in their own speaking or writing.",
          "Students know common prefixes, suffixes, and roots but do not yet apply them reliably."
      ],
      "Grammar and conventions": [
          "Students know the basic rules for sentences and punctuation but still make errors in their own writing.",
          "Students have practiced editing a sample passage with a checklist.",
          "Students have not yet applied the rules for {topic} in a piece of their own writing."
      ],
      "Discussion skills": [
          "Students have taken part in partner and small-group discussions, with sentence starters.",
          "Students know the class discussion norms but need practice responding to a peer's idea.",
          "Students have not yet led a discussion on {topic}."
      ],
      "Research": [
          "Students have looked up information online with help but have not yet judged how reliable a source is.",
          "Students have taken notes from a single source and are new to combining several sources.",
          "Students have not yet cited sources in a research product on {topic}."
      ],
      "Revising and editing": [
          "Students have revised a draft after peer feedback, with a checklist.",
          "Students tend to edit for spelling first and revise ideas and organization less.",
          "Students have not yet revised a draft of {topic} on their own."
      ]
  },
  // Terms and definitions pre-filled on the Content screen for the skills picked. See Lesson-Planner_RevisionMap_v1.md, section 3.
  termBank: {
      "Narrative writing": [
          [
              "Narrative technique",
              "A choice a writer makes, such as dialogue or description, to develop characters and events."
          ],
          [
              "Dialogue",
              "The words characters say to each other in a text."
          ],
          [
              "Inner thoughts",
              "What a character thinks but does not say aloud."
          ],
          [
              "Pacing",
              "How fast or slow events unfold in a story."
          ],
          [
              "Sensory detail",
              "Description that appeals to sight, sound, smell, taste, or touch."
          ],
          [
              "Point of view",
              "The perspective from which a story is told."
          ],
          [
              "Plot",
              "The sequence of events in a story."
          ],
          [
              "Scene",
              "A part of a story that happens in one setting and time."
          ]
      ],
      "Argument writing": [
          [
              "Claim",
              "The main position a writer argues for."
          ],
          [
              "Counterclaim",
              "A claim that opposes or challenges the writer's claim."
          ],
          [
              "Evidence",
              "Facts, examples, or quotations used to support a claim."
          ],
          [
              "Reasoning",
              "The explanation that connects evidence to a claim."
          ],
          [
              "Rebuttal",
              "A response that answers a counterclaim."
          ],
          [
              "Credibility",
              "How believable a writer or source is."
          ]
      ],
      "Informational/Expository writing": [
          [
              "Topic sentence",
              "A sentence that states the main idea of a paragraph."
          ],
          [
              "Thesis",
              "The central idea of a whole piece of writing."
          ],
          [
              "Supporting detail",
              "A fact or example that develops a main idea."
          ],
          [
              "Transition",
              "A word or phrase that links ideas."
          ],
          [
              "Organizational structure",
              "The pattern used to arrange information, such as compare and contrast or cause and effect."
          ],
          [
              "Domain-specific vocabulary",
              "Words that belong to one subject or field."
          ],
          [
              "Conclusion",
              "The final section, which follows from and sums up the ideas presented."
          ]
      ],
      "Characterization": [
          [
              "Characterization",
              "The methods a writer uses to reveal what a character is like."
          ],
          [
              "Direct characterization",
              "The narrator tells the reader what a character is like."
          ],
          [
              "Indirect characterization",
              "The reader learns about a character through speech, actions, thoughts, and what others say."
          ],
          [
              "Motivation",
              "The reason a character acts as they do."
          ],
          [
              "Static character",
              "A character who does not change much over the text."
          ],
          [
              "Dynamic character",
              "A character who changes over the course of the text."
          ],
          [
              "Protagonist",
              "The main character."
          ],
          [
              "Antagonist",
              "A character or force that opposes the protagonist."
          ]
      ],
      "Conflict": [
          [
              "Conflict",
              "A struggle between opposing forces in a story."
          ],
          [
              "Internal conflict",
              "A struggle within a character's own mind."
          ],
          [
              "External conflict",
              "A struggle between a character and an outside force, such as another character, society, or nature."
          ],
          [
              "Rising action",
              "The events that build tension toward the climax."
          ],
          [
              "Climax",
              "The turning point, where tension is highest."
          ],
          [
              "Resolution",
              "The outcome of the conflict and how the story ends."
          ]
      ],
      "Theme": [
          [
              "Theme",
              "A central message or insight about life that a text develops."
          ],
          [
              "Topic",
              "What a text is about, in a word or phrase."
          ],
          [
              "Central idea",
              "The main point an informational text develops."
          ],
          [
              "Symbol",
              "An object, person, or place that stands for a larger idea."
          ],
          [
              "Motif",
              "An image, phrase, or idea that repeats and supports a theme."
          ],
          [
              "Inference",
              "A conclusion drawn from evidence and reasoning."
          ]
      ],
      "Evidence and citation": [
          [
              "Textual evidence",
              "Words or details from a text, quoted or paraphrased, that support a claim."
          ],
          [
              "Quotation",
              "The exact words from a source, set in quotation marks."
          ],
          [
              "Paraphrase",
              "A restatement of a source's idea in your own words."
          ],
          [
              "Citation",
              "A note that tells where information came from."
          ],
          [
              "Analysis",
              "An explanation of what evidence means and why it matters."
          ],
          [
              "Integrate a quotation",
              "To work a quotation smoothly into your own sentence."
          ]
      ],
      "Vocabulary": [
          [
              "Context clue",
              "A hint in nearby words that helps reveal a word's meaning."
          ],
          [
              "Prefix",
              "A word part added at the front of a word that changes its meaning."
          ],
          [
              "Suffix",
              "A word part added at the end of a word that changes its meaning or use."
          ],
          [
              "Root",
              "The base part of a word that carries its core meaning."
          ],
          [
              "Connotation",
              "The feelings or associations a word carries beyond its literal meaning."
          ],
          [
              "Denotation",
              "The literal dictionary meaning of a word."
          ],
          [
              "Academic vocabulary",
              "General words that appear often in school texts across subjects."
          ]
      ],
      "Grammar and conventions": [
          [
              "Parallel structure",
              "Using the same grammatical form for items in a pair or a list."
          ],
          [
              "Phrase",
              "A group of related words that works as one unit but does not have both a subject and a verb."
          ],
          [
              "Clause",
              "A group of words with a subject and a verb."
          ],
          [
              "Semicolon",
              "Punctuation that links closely related independent clauses."
          ],
          [
              "Colon",
              "Punctuation that introduces a list or a quotation."
          ],
          [
              "Conventions",
              "The accepted rules for grammar, punctuation, capitalization, and spelling."
          ]
      ],
      "Discussion skills": [
          [
              "Collaborative discussion",
              "A conversation where people build on each other's ideas to reach understanding."
          ],
          [
              "Norms",
              "Agreed-upon rules for how a group talks together."
          ],
          [
              "Active listening",
              "Paying full attention to a speaker and showing you understood."
          ],
          [
              "Paraphrase",
              "To restate what someone said in your own words."
          ],
          [
              "Perspective",
              "A particular point of view on an issue."
          ],
          [
              "Consensus",
              "Agreement reached by the whole group."
          ]
      ],
      "Research": [
          [
              "Source",
              "Where a piece of information comes from."
          ],
          [
              "Credible source",
              "A source that is accurate, current, and written by someone with knowledge of the topic."
          ],
          [
              "Primary source",
              "A first-hand account or original document from the time being studied."
          ],
          [
              "Secondary source",
              "A source that interprets or discusses primary sources."
          ],
          [
              "Plagiarism",
              "Using someone else's words or ideas without giving credit."
          ],
          [
              "Research question",
              "A focused question a research project sets out to answer."
          ]
      ],
      "Revising and editing": [
          [
              "Revising",
              "Changing a draft's ideas, organization, and evidence to make it stronger."
          ],
          [
              "Editing",
              "Correcting grammar, punctuation, capitalization, and spelling."
          ],
          [
              "Proofreading",
              "A final check for errors before a piece is shared."
          ],
          [
              "Peer feedback",
              "Comments from classmates on a draft."
          ],
          [
              "Draft",
              "An early version of a piece of writing."
          ]
      ]
  },
  assets: ['Home languages', 'Personal experience with the topic', 'Family and community stories', 'Popular culture and media', 'Interests outside school', 'Experience with the text\'s setting or themes', 'Ways they communicate with different people'],
  // Skill to standards: strand and anchor numbers. Sub-standards (3a to 3e) come with their anchor. See Lesson-Planner_RevisionMap_v1.md, section 1.
  skillStandards: {
    'Narrative writing': { W: [3, 4, 5, 10] },
    'Argument writing': { W: [1, 4, 5, 9, 10] },
    'Informational/Expository writing': { W: [2, 4, 5, 10] },
    'Characterization': { RL: [1, 3, 6] },
    'Conflict': { RL: [3, 5] },
    'Theme': { RL: [2], RI: [2] },
    'Evidence and citation': { RL: [1], RI: [1], W: [8, 9] },
    'Vocabulary': { L: [4, 5, 6], RL: [4], RI: [4] },
    'Grammar and conventions': { L: [1, 2, 3] },
    'Discussion skills': { SL: [1, 2, 3, 4, 6] },
    'Research': { W: [7, 8, 9] },
    'Revising and editing': { W: [4, 5], L: [1, 2, 3] }
  },
  connections: ['Creative writing', 'History', 'Psychology', 'Science', 'Art', 'Math', 'Music', 'None'],
  eqStems: [
    'How do {who} use {what} to {purpose}?',
    'Why does {idea} matter for {context}?',
    'What makes {thing} effective?'
  ],
  materials: ['The book or text', 'Computer', 'Projector or TV', 'Internet access', 'Slide presentation', 'Whiteboard and markers', 'Desks and chairs', 'Pencils or pens', 'Graphic organizer', 'Exit slip', 'Printed handouts', 'Notebooks or journals', 'Chart paper', 'Sticky notes'],
  grouping: ['Whole class', 'Individual work', 'Partners', 'Think-pair-share', 'Small groups of 3 to 4', 'Jigsaw', 'Stations or rotations', 'Fishbowl', 'Teacher-led small group', 'Peer conferencing'],
  seating: ['Normal seats', 'Rearranged desks', 'Stations around the room', 'Floor or other space'],
  skills: ['Narrative writing', 'Argument writing', 'Informational/Expository writing', 'Characterization', 'Conflict', 'Theme', 'Evidence and citation', 'Vocabulary', 'Grammar and conventions', 'Discussion skills', 'Research', 'Revising and editing'],
  activities: {
    motivating: ['Journal prompt', 'Discussion with hot-takes', 'Short video', 'Image or artifact analysis', 'Quick write', 'Game or challenge'],
    background: ['KWL chart', 'Anticipation guide', 'Brainstorm', 'Review of the previous lesson', 'Think-pair-share'],
    language: ['Slide presentation of terms', 'Word wall', 'Vocabulary graphic organizer', 'Sentence frames', 'Teacher think-aloud on terms'],
    direct: ['Mini-lesson', 'Teacher think-aloud', 'Mentor text analysis', 'Worked example', 'Student volunteers demonstrate'],
    guided: ['Partner work with graphic organizer', 'Small-group task', 'Annotate together', 'Practice with feedback'],
    independent: ['Exit slip', 'Short writing task', 'Annotation', 'Problem set', 'Reading response'],
    closure: ['Review the essential question', 'Exit slip', 'Share-out', 'One-sentence summary', 'Students use the new terms']
  },
  assessments: {
    informal: ['Observation during practice', 'One-to-one conferencing', 'Questioning', 'Thumbs up or down', 'Whiteboard responses', 'Graphic organizer check', 'Journal review'],
    formal: ['Exit slip', 'Quiz', 'Writing sample with rubric', 'Essay with rubric', 'Presentation with rubric', 'Unit test']
  },
  diff: {
    evidence: ['IEP', '504 plan', 'ELL', 'ADHD', 'Struggling reader', 'Other'],
    strategies: {
      'ELL': ['Vocabulary support for key terms', 'Sentence frames or examples', 'Visuals alongside text', 'Partner who shares a language', 'Extra processing time'],
      'IEP': ['Follow the IEP accommodations (name the ones used)', 'Chunked directions', 'Printed copies of the slides', 'Reduced task length', 'Check-ins during work'],
      '504 plan': ['Follow the 504 accommodations (name the ones used)', 'Extended time', 'Preferential seating', 'Printed notes', 'Breaks as needed'],
      'ADHD': ['Chunked tasks with a checklist', 'Movement or a job during the lesson', 'Seat near the front', 'Visual timer', 'Frequent check-ins'],
      'Struggling reader': ['Audio or chunked text', 'Pre-taught vocabulary', 'Guided annotation', 'Graphic organizer with prompts', 'Smaller passage'],
      'Other': []
    }
  },
  enrich: {
    evidence: ['Reads or writes above grade level', 'Advanced in this skill', 'Identified gifted and talented', 'Other'],
    strategies: ['A more complex text or prompt', 'A constraint that raises the challenge', 'An extension that asks for creating or evaluating', 'Peer mentor role, by choice', 'An independent project']
  }
};
