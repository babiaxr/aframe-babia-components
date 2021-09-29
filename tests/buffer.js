/*
 * Cypress test for NotiBuffer
 */

const NotiBuffer = require("../common/noti-buffer").NotiBuffer;

// Object providing an update function that will be used by tests
const obj = {
    update(data) {
        assert.equal(data,5);
    },
    update1(data) {
    },
    update2(data) {
    },
    update3(data) {
    }
}

describe ('Babia NotiBuffer', () => {

    it ('Creation', () => {
        let buffer = new NotiBuffer();
        assert.deepEqual(buffer.notifiers,{});
    });

    it ('Set value', () => {
        let buffer = new NotiBuffer();
        buffer.set(5);
        assert.equal(buffer.data,5);
    });

    // Sets value before registering
    it ('Register (after)', () => {
        cy.spy(obj,'update');
        let buffer = new NotiBuffer();
        buffer.set(5);
        buffer.register(obj.update);
        expect(obj.update).to.be.called
    });

    // Sets value after registering
    it ('Register (before)', () => {
        cy.spy(obj,'update');
        let buffer = new NotiBuffer();
        buffer.register(obj.update);
        buffer.set(5);
        expect(obj.update).to.be.called
    });

    // Sets value before and after registering
    it ('Register (before)', () => {
        cy.spy(obj,'update2');
        let buffer = new NotiBuffer();
        buffer.set(4);
        buffer.register(obj.update2);
        buffer.set(5);
        expect(obj.update2).to.be.called
        expect(obj.update2).to.be.calledWith(4)
        expect(obj.update2).to.be.calledWith(5)
    });

    // Sets value and register three notifiers
    it ('Register (before)', () => {
        cy.spy(obj,'update1');
        cy.spy(obj,'update2');
        cy.spy(obj,'update3');
        let buffer = new NotiBuffer();
        buffer.set(4);
        buffer.register(obj.update1);
        buffer.set(5);
        buffer.register(obj.update2);
        buffer.set(6);
        buffer.register(obj.update3);
        expect(obj.update1).to.be.calledThrice;
        expect(obj.update2).to.be.calledTwice;
        expect(obj.update3).to.be.calledOnce;
        expect(obj.update1).to.be.calledWith(4)
        expect(obj.update1).to.be.calledWith(5)
        expect(obj.update1).to.be.calledWith(6)
        expect(obj.update2).to.be.calledWith(5)
        expect(obj.update2).to.be.calledWith(6)
        expect(obj.update3).to.be.calledWith(6)
    });

    // Sets value and register, and unregister, three notifiers
    it ('Register (before)', () => {
        cy.spy(obj,'update1');
        cy.spy(obj,'update2');
        cy.spy(obj,'update3');
        let buffer = new NotiBuffer();
        buffer.set(1);
        let id1 = buffer.register(obj.update1);
        buffer.set(2);
        let id2 = buffer.register(obj.update2);
        buffer.set(3);
        let id3 = buffer.register(obj.update3);
        buffer.unregister(id1);
        buffer.set(4);
        buffer.unregister(id2);
        buffer.unregister(id3);
        buffer.set(5);
        let id4 = buffer.register(obj.update3);
        buffer.unregister(id2);
        buffer.set(6);
        buffer.unregister(id4);
        buffer.set(7);
        expect(obj.update1).to.be.calledThrice;
        expect(obj.update2).to.be.calledThrice;
        expect(obj.update3).to.have.callCount(4);
        expect(obj.update1).to.be.calledWith(1)
        expect(obj.update1).to.be.calledWith(2)
        expect(obj.update1).to.be.calledWith(3)
        expect(obj.update1).not.to.be.calledWith(4)
        expect(obj.update2).to.be.calledWith(2)
        expect(obj.update2).to.be.calledWith(3)
        expect(obj.update2).to.be.calledWith(4)
        expect(obj.update2).not.to.be.calledWith(1)
        expect(obj.update2).not.to.be.calledWith(5)
        expect(obj.update3).to.be.calledWith(3)
        expect(obj.update3).to.be.calledWith(4)
        expect(obj.update3).to.be.calledWith(5)
        expect(obj.update3).to.be.calledWith(6)
        expect(obj.update3).not.to.be.calledWith(2)
        expect(obj.update3).not.to.be.calledWith(7)
    });

});
