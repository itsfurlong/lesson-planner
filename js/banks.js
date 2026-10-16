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
  knowledge: ['factual', 'conceptual', 'procedural', 'metacognitive'],
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
