// Script to create a sample proposal for testing
import { db } from './nodeDatabaseService.js';

console.log('Creating sample student group and proposal...\n');

try {
  // First, let's create a student group
  console.log('Creating student group...');
  
  const sampleGroup = {
    name: 'AI Research Group',
    project_type: 'thesis',
    field_of_interest: 'Artificial Intelligence',
    status: 'active',
    created_by: 'S001'
  };
  
  const createdGroup = await db.entities.StudentGroup.create(sampleGroup);
  console.log(`✅ Created group: ${createdGroup.name} (ID: ${createdGroup.id})`);
  
  // Assign students to this group
  console.log('Assigning students to group...');
  
  // Update students to be part of this group
  const studentsToUpdate = ['S001', 'S002'];
  for (const studentId of studentsToUpdate) {
    const students = await db.entities.Student.filter({ student_id: studentId });
    if (students.length > 0) {
      await db.entities.Student.update(students[0].id, { 
        group_id: createdGroup.id,
        is_group_admin: studentId === 'S001' // First student is admin
      });
      console.log(`✅ Assigned ${students[0].full_name} to group`);
    }
  }
  
  // Create a sample proposal
  console.log('Creating sample proposal...');
  
  const sampleProposal = {
    group_id: createdGroup.id,
    title: 'AI-Based Predictive Analytics for Financial Markets',
    description: 'This research aims to develop machine learning models that can predict financial market trends using historical data and real-time indicators.',
    full_proposal: `# AI-Based Predictive Analytics for Financial Markets

## Abstract
This research project focuses on developing advanced machine learning algorithms to predict financial market trends. By leveraging historical trading data, economic indicators, and news sentiment analysis, we aim to create a robust predictive model.

## Objectives
1. Collect and preprocess financial market data
2. Implement various ML algorithms for prediction
3. Evaluate model performance using standard metrics
4. Develop a user-friendly interface for predictions

## Methodology
We will use supervised learning techniques including LSTM networks, Random Forest, and Support Vector Machines to analyze time-series financial data.

## Expected Outcomes
A functional prototype that can provide accurate short-term market predictions with a user-friendly dashboard.`,
    project_type: 'thesis',
    field: 'Artificial Intelligence',
    keywords: ['Machine Learning', 'Financial Markets', 'Predictive Analytics', 'LSTM'],
    status: 'submitted'
  };
  
  const createdProposal = await db.entities.Proposal.create(sampleProposal);
  console.log(`✅ Created proposal: ${createdProposal.title}`);
  
  console.log('\n✅ Sample group and proposal created successfully!');
  console.log('\nGroup Details:');
  console.log(`  Name: ${createdGroup.name}`);
  console.log(`  ID: ${createdGroup.id}`);
  console.log(`  Field: ${sampleProposal.field}`);
  console.log('\nProposal Details:');
  console.log(`  Title: ${createdProposal.title}`);
  console.log(`  Status: ${createdProposal.status}`);
  console.log(`  Keywords: ${createdProposal.keywords.join(', ')}`);
  
} catch (error) {
  console.error('❌ Failed to create sample group and proposal:', error.message);
  process.exit(1);
}