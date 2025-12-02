"use client";

export default function UserPage() {
  return (
        <div className="user-view">
            <div className="user-header">
                <h1 className="user-title">Users</h1>
                <div className="user-filters">
            <span className="filter-text">This week</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
            </svg>
        </div>
      </div>

            <div className="user-columns">
        {/* To do Column */}
                <div className="user-column">
          <div className="column-header">
            <div className="header-left">
                <div className="status-indicator todo"></div>
                <span className="column-title">To do</span>
                <span className="column-count">3</span>
            </div>
            <div className="header-actions">
                <button className="add-btn">+</button>
                <button className="more-btn">...</button>
            </div>
          </div>
          
          <div className="column-content">
            <div className="task-card">
                <div className="card-header">
                    <span className="tag design">Design System</span>
                    <button className="card-more">...</button>
                </div>
                <h3 className="card-title">Hero section</h3>
                <p className="card-desc">Create a design system for a hero section in 2 different variants.</p>
                <div className="card-footer">
                    <div className="members">
                        <div className="member-avatar blue">VH</div>
                        <div className="member-avatar orange">AG</div>
                    </div>
                </div>
            </div>

            <div className="task-card">
                <div className="card-header">
                    <span className="tag typography">Typography</span>
                    <button className="card-more">...</button>
                </div>
                <h3 className="card-title">Typography change</h3>
                <p className="card-desc">Modify typography and styling of text placed on 6 screens.</p>
                <div className="card-footer">
                    <div className="members">
                        <div className="member-avatar pink">ML</div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* In Progress Column */}
                <div className="user-column">
          <div className="column-header">
            <div className="header-left">
                <div className="status-indicator progress"></div>
                <span className="column-title">In progress</span>
                <span className="column-count">1</span>
            </div>
            <div className="header-actions">
                <button className="add-btn">+</button>
                <button className="more-btn">...</button>
            </div>
          </div>

          <div className="column-content">
            <div className="task-card">
                <div className="card-header">
                    <span className="tag development">Development</span>
                    <button className="card-more">...</button>
                </div>
                <h3 className="card-title">Implement design screens</h3>
                <p className="card-desc">Our designers created 6 screens for a website that needs to be implemented.</p>
                <div className="card-footer">
                    <div className="members">
                        <div className="member-avatar blue">VH</div>
                        <div className="member-avatar green">LK</div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Done Column */}
                <div className="user-column">
          <div className="column-header">
            <div className="header-left">
                <div className="status-indicator done"></div>
                <span className="column-title">Done</span>
                <span className="column-count">2</span>
            </div>
            <div className="header-actions">
                <button className="add-btn">+</button>
                <button className="more-btn">...</button>
            </div>
          </div>

          <div className="column-content">
            <div className="task-card">
                <div className="card-header">
                    <span className="tag development">Development</span>
                    <button className="card-more">...</button>
                </div>
                <h3 className="card-title">Fix bugs in the CSS code</h3>
                <p className="card-desc">Fix small bugs that are essential to prepare for the next release.</p>
                <div className="card-footer">
                    <div className="members">
                        <div className="member-avatar pink">HU</div>
                        <div className="member-avatar orange">NL</div>
                    </div>
                </div>
            </div>

            <div className="task-card">
                <div className="card-header">
                    <span className="tag typography">Typography</span>
                    <button className="card-more">...</button>
                </div>
                <h3 className="card-title">Proofread final text</h3>
                <p className="card-desc">The text provided by marketing department needs to be proofread.</p>
                <div className="card-footer">
                    <div className="members">
                        <div className="member-avatar orange">AG</div>
                    </div>
                </div>
            </div>
             <div className="task-card">
                <div className="card-header">
                    <span className="tag design">Design System</span>
                    <button className="card-more">...</button>
                </div>
                <h3 className="card-title">Responsive design</h3>
                <p className="card-desc">All designs need to be responsive. The requirement is that it fits all web and mobile screens.</p>
                <div className="card-footer">
                    <div className="members">
                        <div className="member-avatar blue">VH</div>
                        <div className="member-avatar orange">AG</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

