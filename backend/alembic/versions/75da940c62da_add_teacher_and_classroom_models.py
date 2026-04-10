"""Add teacher and classroom models

Revision ID: 75da940c62da
Revises: 
Create Date: 2026-04-10 05:23:38.380225

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '75da940c62da'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create classrooms table first
    op.create_table('classrooms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('teacher_id', sa.Integer(), nullable=True),
        sa.Column('unique_code', sa.String(), nullable=False),
        sa.Column('approval_mode', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('teacher_id')
    )
    op.create_index(op.f('ix_classrooms_id'), 'classrooms', ['id'], unique=False)
    op.create_index(op.f('ix_classrooms_unique_code'), 'classrooms', ['unique_code'], unique=True)

    # Create classroom_requests table
    op.create_table('classroom_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=True),
        sa.Column('classroom_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('requested_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['classroom_id'], ['classrooms.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_classroom_requests_id'), 'classroom_requests', ['id'], unique=False)

    # Update users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('classroom_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_user_classroom', 'classrooms', ['classroom_id'], ['id'])

def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('fk_user_classroom', type_='foreignkey')
        batch_op.drop_column('classroom_id')

    op.drop_index(op.f('ix_classroom_requests_id'), table_name='classroom_requests')
    op.drop_table('classroom_requests')
    op.drop_index(op.f('ix_classrooms_unique_code'), table_name='classrooms')
    op.drop_index(op.f('ix_classrooms_id'), table_name='classrooms')
    op.drop_table('classrooms')
